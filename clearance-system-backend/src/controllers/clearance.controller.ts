import { Request, Response } from "express";
import { FormType, PrismaClient } from "../../generated/prisma";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Email transporter configuration
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// Interface for the response structure
interface WorkflowStepResponse {
	stepOrder: number;
	officeName: string;
	description: string;
	status: string;
	approverName?: string;
}

interface WorkflowResponse {
	workflowId: string;
	description: string;
	steps: WorkflowStepResponse[];
	progress: number;
}

interface ReasonResponse {
	id: string;
	reason: string;
}

// Get workflow based on formType and user program
export const getWorkflow = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.user; // Use id from JWT payload
		const { formType, programType, programCategory } = req.body;

		// Validate formType
		if (
			!["TERMINATION", "ID_REPLACEMENT", "TEACHER_CLEARANCE"].includes(formType)
		) {
			res.status(400).json({ status: "error", message: "Invalid form type" });
			return;
		}

		// Fetch user details
		const user = await prisma.user.findUnique({
			where: { id },
			select: { role: true },
		});

		if (!user) {
			res.status(404).json({ status: "error", message: "User not found" });
			return;
		}

		let workflowRule;

		if (user.role === "TEACHER" && formType === "TEACHER_CLEARANCE") {
			// Teachers: Fixed TEACHER_CLEARANCE workflow
			workflowRule = await prisma.workflowRule.findFirst({
				where: { formType: "TEACHER_CLEARANCE" },
				include: {
					workflowSteps: {
						include: { office: { select: { name: true } } },
						orderBy: { stepOrder: "asc" },
					},
				},
			});
		} else if (user.role === "STUDENT") {
			// Students: Fetch program details
			const student = await prisma.student.findFirst({
				where: { userId: id },
				include: { program: true },
			});

			if (!student) {
				res
					.status(404)
					.json({ status: "error", message: "Student record not found" });
				return;
			}

			// Use provided programType and programCategory if available, else use student's program
			const selectedProgramType = programType || student.program.type;
			const selectedProgramCategory =
				programCategory || student.program.category;

			// Validate program type and category
			if (!["POSTGRADUATE", "DIPLOMA"].includes(selectedProgramType)) {
				res
					.status(400)
					.json({ status: "error", message: "Invalid program type" });
				return;
			}
			if (
				!["REGULAR", "EXTENSION", "SUMMER", "EVENING"].includes(
					selectedProgramCategory
				)
			) {
				res
					.status(400)
					.json({ status: "error", message: "Invalid program category" });
				return;
			}

			// Find workflow rule based on formType and program
			workflowRule = await prisma.workflowRule.findFirst({
				where: {
					formType,
					programId: {
						in: (
							await prisma.program.findMany({
								where: {
									type: selectedProgramType,
									category: selectedProgramCategory,
								},
								select: { id: true },
							})
						).map((p) => p.id),
					},
				},
				include: {
					workflowSteps: {
						include: { office: { select: { name: true } } },
						orderBy: { stepOrder: "asc" },
					},
				},
			});
		} else {
			res.status(403).json({
				status: "error",
				message: "User role not authorized for this request",
			});
			return;
		}

		if (!workflowRule) {
			res.status(404).json({
				status: "error",
				message: "No workflow found for the selected criteria",
			});
			return;
		}

		// Format response
		const response: WorkflowResponse = {
			workflowId: workflowRule.id,
			description: workflowRule.description || "",
			steps: workflowRule.workflowSteps.map((step) => ({
				stepOrder: step.stepOrder,
				officeName: step.office.name,
				description: step.description || "",
				status: "PENDING",
			})),
			progress: 0,
		};

		res.status(200).json(response);
	} catch (error) {
		console.error("Error fetching workflow:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};

// Get workflow for a specific clearance request
export const getRequestWorkflow = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { requestId } = req.params;
		const clearanceRequest = await prisma.clearanceRequest.findUnique({
			where: { id: requestId },
			include: {
				program: true,
				approvalActions: {
					include: {
						approver: {
							include: { user: true },
						},
					},
				},
			},
		});

		if (!clearanceRequest) {
			res
				.status(404)
				.json({ status: "error", message: "Clearance request not found" });
			return;
		}

		const workflowRule = await prisma.workflowRule.findFirst({
			where: {
				formType: clearanceRequest.formType,
				programId: clearanceRequest.programId || undefined,
			},
			include: {
				workflowSteps: {
					include: { office: { select: { name: true } } },
					orderBy: { stepOrder: "asc" },
				},
			},
		});

		if (!workflowRule) {
			res.status(404).json({ status: "error", message: "Workflow not found" });
			return;
		}

		const steps = workflowRule.workflowSteps.map((step) => {
			const action = clearanceRequest.approvalActions.find(
				(a) => a.approver.officeId === step.officeId
			);
			return {
				stepOrder: step.stepOrder,
				officeName: step.office.name,
				description: step.description || "",
				status: action
					? action.status
					: step.stepOrder < clearanceRequest.currentStep
					? "APPROVED"
					: "PENDING",
				approverName: action
					? `${action.approver.user.firstName} ${action.approver.user.fatherName}`
					: undefined,
			};
		});

		const approvedSteps = steps.filter((s) => s.status === "APPROVED").length;
		const progress = Math.round((approvedSteps / steps.length) * 100);

		const response: WorkflowResponse = {
			workflowId: workflowRule.id,
			description: workflowRule.description || "",
			steps,
			progress,
		};

		res.status(200).json({ status: "success", data: response });
	} catch (error) {
		console.error("Error fetching request workflow:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};

// Get reasons based on formType
export const getReasons = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { formType } = req.params;

		if (
			!["TERMINATION", "ID_REPLACEMENT", "TEACHER_CLEARANCE"].includes(formType)
		) {
			res.status(400).json({ status: "error", message: "Invalid form type" });
			return;
		}

		let reasons: ReasonResponse[] = [];

		if (formType === "TERMINATION") {
			const terminationReasons = await prisma.terminationReason.findMany({
				select: { id: true, reason: true },
			});
			reasons = terminationReasons.map((r) => ({
				id: r.id,
				reason: r.reason,
			}));
		} else if (formType === "ID_REPLACEMENT") {
			const idReplacementReasons = await prisma.idReplacementReason.findMany({
				select: { id: true, reason: true },
			});
			reasons = idReplacementReasons.map((r) => ({
				id: r.id,
				reason: r.reason,
			}));
		} else if (formType === "TEACHER_CLEARANCE") {
			const teacherClearanceReasons =
				await prisma.teacherClearanceReason.findMany({
					select: { id: true, reason: true },
				});
			reasons = teacherClearanceReasons.map((r) => ({
				id: r.id,
				reason: r.reason,
			}));
		}

		res.status(200).json({ status: "success", data: reasons });
	} catch (error) {
		console.error("Error fetching reasons:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};

// Get all clearance requests for a user
export const getUserClearanceRequests = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.user;
		const requests = await prisma.clearanceRequest.findMany({
			where: { userId: id },
			include: {
				approvalActions: {
					include: {
						approver: {
							include: { user: true },
						},
					},
				},
				program: true,
				terminationReason: true,
				idReplacementReason: true,
				teacherClearanceReason: true,
			},
			orderBy: { submittedAt: "desc" },
		});

		const formattedRequests = requests.map((req) => {
			const currentAction = req.approvalActions.find(
				(a) => a.status === "PENDING"
			);
			return {
				id: req.id,
				formType: req.formType,
				status: req.status,
				submittedAt: req.submittedAt,
				currentApprover: currentAction
					? `${currentAction.approver.user.firstName} ${currentAction.approver.user.fatherName}`
					: req.status === "APPROVED"
					? "Completed"
					: req.status === "REJECTED"
					? "Rejected"
					: "Unknown",
				workflow: [], // Will be fetched separately
				currentStep: req.currentStep,
				rejectedStep:
					req.status === "REJECTED" ? req.currentStep - 1 : undefined,
				rejectionReason: req.rejectionReason,
				reason:
					req.terminationReason?.reason ||
					req.idReplacementReason?.reason ||
					req.teacherClearanceReason?.reason ||
					"",
			};
		});

		res.status(200).json({ status: "success", data: formattedRequests });
	} catch (error) {
		console.error("Error fetching clearance requests:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};

// Submit clearance request
export const submitClearanceRequest = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: userId } = req.user;
		const {
			formType,
			terminationReasonId,
			idReplacementReasonId,
			teacherClearanceReasonId,
			terminationReason,
			teacherReason,
			comments,
			programType,
			programCategory,
		} = req.body;
		const files = req.files as Express.Multer.File[];

		if (
			!["TERMINATION", "ID_REPLACEMENT", "TEACHER_CLEARANCE"].includes(formType)
		) {
			res.status(400).json({ status: "error", message: "Invalid form type" });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true, email: true, emailVerified: true },
		});

		if (!user) {
			res.status(404).json({ status: "error", message: "User not found" });
			return;
		}

		let programId: string | undefined;
		if (user.role === "STUDENT") {
			const student = await prisma.student.findFirst({
				where: { userId },
				include: { program: true },
			});

			if (!student) {
				res
					.status(404)
					.json({ status: "error", message: "Student record not found" });
				return;
			}

			const selectedProgramType = programType || student.program.type;
			const selectedProgramCategory =
				programCategory || student.program.category;

			if (!["POSTGRADUATE", "DIPLOMA"].includes(selectedProgramType)) {
				res
					.status(400)
					.json({ status: "error", message: "Invalid program type" });
				return;
			}
			if (
				!["REGULAR", "EXTENSION", "SUMMER", "EVENING"].includes(
					selectedProgramCategory
				)
			) {
				res
					.status(400)
					.json({ status: "error", message: "Invalid program category" });
				return;
			}

			const program = await prisma.program.findFirst({
				where: {
					type: selectedProgramType,
					category: selectedProgramCategory,
				},
				select: { id: true },
			});

			if (!program) {
				res.status(404).json({ status: "error", message: "Program not found" });
				return;
			}
			programId = program.id;
		} else if (user.role === "TEACHER") {
			programId = undefined;
		} else {
			res.status(403).json({
				status: "error",
				message: "User role not authorized for this request",
			});
			return;
		}

		const workflowRule = await prisma.workflowRule.findFirst({
			where: {
				formType,
				...(programId ? { programId } : {}),
			},
			include: {
				workflowSteps: {
					include: { office: true },
					orderBy: { stepOrder: "asc" },
				},
			},
		});

		if (!workflowRule) {
			res.status(404).json({
				status: "error",
				message: "No workflow found for the selected criteria",
			});
			return;
		}

		const clearanceRequest = await prisma.$transaction(async (tx) => {
			const requestData: any = {
				id: uuidv4(),
				userId,
				formType,
				programId: programId || "",
				status: "PENDING",
				currentStep: 1,
				submittedAt: new Date(),
			};

			if (formType === "TERMINATION" && terminationReasonId) {
				requestData.terminationReasonId = terminationReasonId;
			} else if (formType === "ID_REPLACEMENT" && idReplacementReasonId) {
				requestData.idReplacementReasonId = idReplacementReasonId;
			} else if (formType === "TEACHER_CLEARANCE" && teacherClearanceReasonId) {
				requestData.teacherClearanceReasonId = teacherClearanceReasonId;
			}

			const request = await tx.clearanceRequest.create({
				data: requestData,
			});

			if (
				formType === "TERMINATION" &&
				terminationReasonId === "Others" &&
				terminationReason
			) {
				const newReason = await tx.terminationReason.create({
					data: {
						id: uuidv4(),
						clearanceRequestId: request.id,
						reason: terminationReason,
					},
				});
				await tx.clearanceRequest.update({
					where: { id: request.id },
					data: { terminationReasonId: newReason.id },
				});
			} else if (
				formType === "TEACHER_CLEARANCE" &&
				teacherClearanceReasonId === "Others" &&
				teacherReason
			) {
				const newReason = await tx.teacherClearanceReason.create({
					data: {
						id: uuidv4(),
						clearanceRequestId: request.id,
						reason: teacherReason,
					},
				});
				await tx.clearanceRequest.update({
					where: { id: request.id },
					data: { teacherClearanceReasonId: newReason.id },
				});
			}

			if (files && files.length > 0) {
				const documentType = await tx.documentType.findFirst({
					where: { requiredFor: { has: formType } },
				});

				for (const file of files) {
					await tx.document.create({
						data: {
							id: uuidv4(),
							clearanceRequestId: request.id,
							documentTypeId: documentType?.id || uuidv4(),
							filePath: file.path,
							uploadedAt: new Date(),
						},
					});
				}
			}

			const firstStep = workflowRule.workflowSteps.find(
				(step) => step.stepOrder === 1
			);
			if (firstStep) {
				const approver = await tx.approver.findFirst({
					where: { officeId: firstStep.officeId },
					include: { user: true },
				});

				if (approver) {
					await tx.approvalAction.create({
						data: {
							id: uuidv4(),
							clearanceRequestId: request.id,
							approverId: approver.id,
							status: "PENDING",
							actionDueBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
						},
					});

					await tx.notification.create({
						data: {
							id: uuidv4(),
							userId: approver.userId,
							clearanceRequestId: request.id,
							title: `New ${formType} Request`,
							message: `A new ${formType.replace(
								/_/g,
								" "
							)} request requires your approval.`,
							type: "ACTION_REQUIRED",
							status: "SENT",
							sentAt: new Date(),
						},
					});

					if (approver.user.email && approver.user.emailVerified) {
						await transporter.sendMail({
							from: process.env.EMAIL_USER,
							to: approver.user.email,
							subject: `New ${formType.replace(/_/g, " ")} Clearance Request`,
							html: `
                <p>Dear ${approver.user.firstName},</p>
                <p>A new ${formType.replace(
									/_/g,
									" "
								)} clearance request has been submitted and requires your approval.</p>
                <p>Please log in to the system to review the request.</p>
                <p>Request ID: ${request.id}</p>
                <p>Thank you,</p>
                <p>Clearance System</p>
              `,
						});
					}
				}
			}

			await tx.notification.create({
				data: {
					id: uuidv4(),
					userId,
					clearanceRequestId: request.id,
					title: `${formType.replace(/_/g, " ")} Request Submitted`,
					message: `Your ${formType.replace(
						/_/g,
						" "
					)} request has been submitted and is pending approval.`,
					type: "INFO",
					status: "SENT",
					sentAt: new Date(),
				},
			});

			if (user.email && user.emailVerified) {
				await transporter.sendMail({
					from: process.env.EMAIL_USER,
					to: user.email,
					subject: `${formType.replace(/_/g, " ")} Request Submitted`,
					html: `
            <p>Dear ${"user, "},</p>
            <p>Your ${formType.replace(
							/_/g,
							" "
						)} clearance request has been successfully submitted.</p>
            <p>Request ID: ${request.id}</p>
            <p>You can track the status in the clearance system.</p>
            <p>Thank you,</p>
            <p>Clearance System</p>
          `,
				});
			}

			return request;
		});

		res.status(200).json({
			status: "success",
			data: {
				id: clearanceRequest.id,
				formType,
				submittedAt: clearanceRequest.submittedAt,
			},
		});
	} catch (error) {
		console.error("Error submitting clearance request:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};

// Approve or reject a clearance request
export const handleApprovalAction = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: approverUserId } = req.user;
		const { requestId, action, comment } = req.body;

		if (!["APPROVE", "REJECT"].includes(action)) {
			res.status(400).json({ status: "error", message: "Invalid action" });
			return;
		}

		const approver = await prisma.approver.findFirst({
			where: { userId: approverUserId },
			include: { user: true },
		});

		if (!approver) {
			res.status(403).json({ status: "error", message: "Not an approver" });
			return;
		}

		const clearanceRequest = await prisma.clearanceRequest.findUnique({
			where: { id: requestId },
			include: {
				user: true,
				approvalActions: {
					include: { approver: true },
				},
				program: true,
			},
		});

		if (!clearanceRequest) {
			res
				.status(404)
				.json({ status: "error", message: "Clearance request not found" });
			return;
		}

		const currentAction = clearanceRequest.approvalActions.find(
			(a) => a.approverId === approver.id && a.status === "PENDING"
		);

		if (!currentAction) {
			res.status(403).json({
				status: "error",
				message: "No pending action for this approver",
			});
			return;
		}

		await prisma.$transaction(async (tx) => {
			await tx.approvalAction.update({
				where: { id: currentAction.id },
				data: {
					status: action === "APPROVE" ? "APPROVED" : "REJECTED",
					comment,
					actionDate: new Date(),
					finalizedAt: new Date(),
				},
			});

			if (action === "REJECT") {
				await tx.clearanceRequest.update({
					where: { id: requestId },
					data: {
						status: "REJECTED",
						rejectionReason: comment || "No reason provided",
					},
				});

				await tx.notification.create({
					data: {
						id: uuidv4(),
						userId: clearanceRequest.userId,
						clearanceRequestId: requestId,
						title: `${clearanceRequest.formType.replace(
							/_/g,
							" "
						)} Request Rejected`,
						message: `Your ${clearanceRequest.formType.replace(
							/_/g,
							" "
						)} request was rejected by ${approver.user.firstName} ${
							approver.user.fatherName
						}. Reason: ${comment || "No reason provided"}`,
						type: "ACTION_REQUIRED",
						status: "SENT",
						sentAt: new Date(),
					},
				});

				if (
					clearanceRequest.user.email &&
					clearanceRequest.user.emailVerified
				) {
					await transporter.sendMail({
						from: process.env.EMAIL_USER,
						to: clearanceRequest.user.email,
						subject: `${clearanceRequest.formType.replace(
							/_/g,
							" "
						)} Request Rejected`,
						html: `
              <p>Dear ${clearanceRequest.user.firstName},</p>
              <p>Your ${clearanceRequest.formType.replace(
								/_/g,
								" "
							)} request was rejected.</p>
              <p>Reason: ${comment || "No reason provided"}</p>
              <p>Please review and resubmit if necessary.</p>
              <p>Request ID: ${requestId}</p>
              <p>Thank you,</p>
              <p>Clearance System</p>
            `,
					});
				}
			} else {
				const workflowRule = await tx.workflowRule.findFirst({
					where: {
						formType: clearanceRequest.formType,
						programId: clearanceRequest.programId || undefined,
					},
					include: {
						workflowSteps: {
							include: { office: true },
							orderBy: { stepOrder: "asc" },
						},
					},
				});

				if (!workflowRule) {
					throw new Error("Workflow not found");
				}

				const nextStep = workflowRule.workflowSteps.find(
					(step) => step.stepOrder === clearanceRequest.currentStep + 1
				);

				if (nextStep) {
					const nextApprover = await tx.approver.findFirst({
						where: { officeId: nextStep.officeId },
						include: { user: true },
					});

					if (nextApprover) {
						await tx.approvalAction.create({
							data: {
								id: uuidv4(),
								clearanceRequestId: requestId,
								approverId: nextApprover.id,
								status: "PENDING",
								actionDueBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
							},
						});

						await tx.notification.create({
							data: {
								id: uuidv4(),
								userId: nextApprover.userId,
								clearanceRequestId: requestId,
								title: `New ${clearanceRequest.formType} Request`,
								message: `A new ${clearanceRequest.formType.replace(
									/_/g,
									" "
								)} request requires your approval.`,
								type: "ACTION_REQUIRED",
								status: "SENT",
								sentAt: new Date(),
							},
						});

						if (nextApprover.user.email && nextApprover.user.emailVerified) {
							await transporter.sendMail({
								from: process.env.EMAIL_USER,
								to: nextApprover.user.email,
								subject: `New ${clearanceRequest.formType.replace(
									/_/g,
									" "
								)} Clearance Request`,
								html: `
                  <p>Dear ${nextApprover.user.firstName},</p>
                  <p>A new ${clearanceRequest.formType.replace(
										/_/g,
										" "
									)} clearance request has been submitted and requires your approval.</p>
                  <p>Please log in to the system to review the request.</p>
                  <p>Request ID: ${requestId}</p>
                  <p>Thank you,</p>
                  <p>Clearance System</p>
                `,
							});
						}
					}

					await tx.clearanceRequest.update({
						where: { id: requestId },
						data: { currentStep: clearanceRequest.currentStep + 1 },
					});
				} else {
					await tx.clearanceRequest.update({
						where: { id: requestId },
						data: { status: "APPROVED" },
					});

					await tx.certificate.create({
						data: {
							id: uuidv4(),
							clearanceRequestId: requestId,
							filePath: `/certificates/${requestId}.pdf`, // Placeholder path
							qrCode: `qr_${requestId}`,
							issuedAt: new Date(),
						},
					});

					await tx.notification.create({
						data: {
							id: uuidv4(),
							userId: clearanceRequest.userId,
							clearanceRequestId: requestId,
							title: `${clearanceRequest.formType.replace(
								/_/g,
								" "
							)} Request Approved`,
							message: `Your ${clearanceRequest.formType.replace(
								/_/g,
								" "
							)} request has been fully approved. You can download your certificate.`,
							type: "INFO",
							status: "SENT",
							sentAt: new Date(),
						},
					});

					if (
						clearanceRequest.user.email &&
						clearanceRequest.user.emailVerified
					) {
						await transporter.sendMail({
							from: process.env.EMAIL_USER,
							to: clearanceRequest.user.email,
							subject: `${clearanceRequest.formType.replace(
								/_/g,
								" "
							)} Request Approved`,
							html: `
                <p>Dear ${clearanceRequest.user.firstName},</p>
                <p>Your ${clearanceRequest.formType.replace(
									/_/g,
									" "
								)} request has been fully approved.</p>
                <p>You can now download your clearance certificate from the system.</p>
                <p>Request ID: ${requestId}</p>
                <p>Thank you,</p>
                <p>Clearance System</p>
              `,
						});
					}
				}
			}
		});

		res.status(200).json({
			status: "success",
			message: `Clearance request ${action.toLowerCase()}d successfully`,
		});
	} catch (error) {
		console.error("Error handling approval action:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};

// Get form types
export const getFormTypes = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.user;
		const user = await prisma.user.findUnique({
			where: { id },
			select: { role: true },
		});

		if (!user) {
			res.status(404).json({ status: "error", message: "User not found" });
			return;
		}

		let formTypes: FormType[] = [];
		if (user.role === "STUDENT") {
			formTypes = ["TERMINATION", "ID_REPLACEMENT"];
		} else if (user.role === "TEACHER") {
			formTypes = ["TEACHER_CLEARANCE"];
		} else {
			res.status(403).json({
				status: "error",
				message: "User role not authorized",
			});
			return;
		}

		res.status(200).json({ status: "success", data: formTypes });
	} catch (error) {
		console.error("Error fetching form types:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};

// Get document types
export const getDocumentTypes = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const documentTypes = await prisma.documentType.findMany({
			select: { id: true, name: true, requiredFor: true },
		});

		res.status(200).json({ status: "success", data: documentTypes });
	} catch (error) {
		console.error("Error fetching document types:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};

// Upload document
export const uploadDocument = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: userId } = req.user;
		const { documentTypeId, requestId } = req.body;
		const file = req.file as Express.Multer.File;

		if (!file || !documentTypeId || !requestId) {
			res
				.status(400)
				.json({ status: "error", message: "Missing required fields" });
			return;
		}

		const clearanceRequest = await prisma.clearanceRequest.findUnique({
			where: { id: requestId, userId },
		});

		if (!clearanceRequest) {
			res
				.status(404)
				.json({ status: "error", message: "Clearance request not found" });
			return;
		}

		const document = await prisma.document.create({
			data: {
				id: uuidv4(),
				clearanceRequestId: requestId,
				documentTypeId,
				filePath: file.path,
				uploadedAt: new Date(),
			},
		});

		res.status(200).json({ status: "success", data: document });
	} catch (error) {
		console.error("Error uploading document:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};

// Get pending documents for a clearance request
export const getPendingDocuments = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: userId } = req.user;
		const { requestId } = req.params;

		const clearanceRequest = await prisma.clearanceRequest.findUnique({
			where: { id: requestId, userId },
			include: { documents: { include: { documentType: true } } },
		});

		if (!clearanceRequest) {
			res
				.status(404)
				.json({ status: "error", message: "Clearance request not found" });
			return;
		}

		const documentTypes = await prisma.documentType.findMany({
			where: { requiredFor: { has: clearanceRequest.formType } },
		});

		const pendingDocuments = documentTypes
			.filter(
				(dt) =>
					!clearanceRequest.documents.some((d) => d.documentTypeId === dt.id)
			)
			.map((dt) => ({
				id: dt.id,
				name: dt.name,
				description: dt.description || "",
				status: "pending",
			}));

		const submittedDocuments = clearanceRequest.documents.map((d) => ({
			id: d.id,
			name: d.documentType.name,
			description: d.documentType.description || "",
			status: "submitted",
		}));

		res.status(200).json({
			status: "success",
			data: [...submittedDocuments, ...pendingDocuments],
		});
	} catch (error) {
		console.error("Error fetching pending documents:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};
