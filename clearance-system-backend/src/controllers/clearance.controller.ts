import { Request, Response } from "express";
import { FormType, PrismaClient } from "../../generated/prisma";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit"; // Ensure pdfkit is installed
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

transporter.verify((error) => {
	if (error) {
		console.error("Email service error:", error);
	} else {
		console.log("Email service is ready");
	}
});

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

export const getWorkflow = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.user;
		const { formType, programType, programCategory } = req.body;

		if (
			!["TERMINATION", "ID_REPLACEMENT", "TEACHER_CLEARANCE"].includes(formType)
		) {
			res.status(400).json({ status: "error", message: "Invalid form type" });
			return;
		}

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

			const selectedProgramType = programType || student.program.type;
			const selectedProgramCategory =
				programCategory || student.program.category;

			if (
				!["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA"].includes(
					selectedProgramType
				)
			) {
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
			res
				.status(403)
				.json({ status: "error", message: "User role not authorized" });
			return;
		}

		if (!workflowRule) {
			res.status(404).json({ status: "error", message: "No workflow found" });
			return;
		}

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
				approvalActions: { include: { approver: { include: { user: true } } } },
				terminationReason: true,
				idReplacementReason: true,
				teacherClearanceReason: true,
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
					: step.stepOrder === clearanceRequest.currentStep
					? "PENDING"
					: "WAITING",
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
			reasons = terminationReasons.map((r) => ({ id: r.id, reason: r.reason }));
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

export const getUserClearanceRequests = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.user;
		const requests = await prisma.clearanceRequest.findMany({
			where: { userId: id },
			include: {
				approvalActions: { include: { approver: { include: { user: true } } } },
				program: true,
				terminationReason: true,
				idReplacementReason: true,
				teacherClearanceReason: true,
				user: {
					include: {
						student: { include: { department: true, program: true } },
						teacher: { include: { department: true } },
					},
				},
			},
			orderBy: { submittedAt: "desc" },
		});

		const formattedRequests = await Promise.all(
			requests.map(async (req) => {
				const workflowRule = await prisma.workflowRule.findFirst({
					where: {
						formType: req.formType,
						programId: req.programId || undefined,
					},
					include: {
						workflowSteps: {
							include: { office: { select: { name: true } } },
							orderBy: { stepOrder: "asc" },
						},
					},
				});

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
						: req.status === "COMPLETED"
						? "Completed"
						: req.status === "REJECTED"
						? "Rejected"
						: "Unknown",
					workflow: workflowRule
						? workflowRule.workflowSteps.map((step) => step.office.name)
						: [],
					currentStep: req.currentStep,
					rejectedStep:
						req.status === "REJECTED" ? req.currentStep - 1 : undefined,
					rejectionReason: req.rejectionReason,
					reason:
						req.terminationReason?.reason ||
						req.idReplacementReason?.reason ||
						req.teacherClearanceReason?.reason ||
						"Not specified",
					userInfo: {
						firstName: req.user.firstName,
						fatherName: req.user.fatherName,
						grandfatherName: req.user.grandfatherName,
						department:
							req.user.role === "STUDENT"
								? req.user.student?.department.name
								: req.user.teacher?.department.name,
						programType:
							req.user.role === "STUDENT"
								? req.user.student?.program.type
								: null,
						programCategory:
							req.user.role === "STUDENT"
								? req.user.student?.program.category
								: null,
						academicStatus:
							req.user.role === "STUDENT"
								? req.user.student?.academicStatus
								: null,
						employmentStatus:
							req.user.role === "TEACHER"
								? req.user.teacher?.employmentStatus
								: null,
					},
				};
			})
		);

		res.status(200).json({ status: "success", data: formattedRequests });
	} catch (error) {
		console.error("Error fetching clearance requests:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};

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

		if (formType === "TERMINATION" && !terminationReasonId) {
			res.status(400).json({
				status: "error",
				message: "Termination reason ID is required",
			});
			return;
		}
		if (formType === "ID_REPLACEMENT" && !idReplacementReasonId) {
			res.status(400).json({
				status: "error",
				message: "ID replacement reason ID is required",
			});
			return;
		}
		if (formType === "TEACHER_CLEARANCE" && !teacherClearanceReasonId) {
			res.status(400).json({
				status: "error",
				message: "Teacher clearance reason ID is required",
			});
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				role: true,
				email: true,
				emailVerified: true,
				firstName: true,
				fatherName: true,
				grandfatherName: true,
				student: { include: { department: true, program: true } },
				teacher: { include: { department: true } },
			},
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

			if (
				!["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA"].includes(
					selectedProgramType
				)
			) {
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
				where: { type: selectedProgramType, category: selectedProgramCategory },
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
			res
				.status(403)
				.json({ status: "error", message: "User role not authorized" });
			return;
		}

		const workflowRule = await prisma.workflowRule.findFirst({
			where: { formType, ...(programId ? { programId } : {}) },
			include: {
				workflowSteps: {
					include: { office: true },
					orderBy: { stepOrder: "asc" },
				},
			},
		});

		if (!workflowRule) {
			res.status(404).json({ status: "error", message: "No workflow found" });
			return;
		}

		let reasonExists = false;
		let reasonText = "";
		if (formType === "TERMINATION" && terminationReasonId) {
			const reason = await prisma.terminationReason.findUnique({
				where: { id: terminationReasonId },
			});
			if (reason) {
				reasonExists = true;
				reasonText = reason.reason;
			}
		} else if (formType === "ID_REPLACEMENT" && idReplacementReasonId) {
			const reason = await prisma.idReplacementReason.findUnique({
				where: { id: idReplacementReasonId },
			});
			if (reason) {
				reasonExists = true;
				reasonText = reason.reason;
			}
		} else if (formType === "TEACHER_CLEARANCE" && teacherClearanceReasonId) {
			const reason = await prisma.teacherClearanceReason.findUnique({
				where: { id: teacherClearanceReasonId },
			});
			if (reason) {
				reasonExists = true;
				reasonText = reason.reason;
			}
		}

		if (!reasonExists) {
			res
				.status(400)
				.json({ status: "error", message: "Invalid or missing reason" });
			return;
		}

		let startStep = 1;
		let resubmission = false;
		const existingRequest = await prisma.clearanceRequest.findFirst({
			where: { id: req.body.requestId, userId, status: "REJECTED" },
		});

		if (existingRequest) {
			resubmission = true;
			startStep = existingRequest.currentStep;
		}

		const clearanceRequest = await prisma.$transaction(async (tx) => {
			const requestData: any = {
				id: resubmission ? existingRequest!.id : uuidv4(),
				userId,
				formType,
				programId: programId || "",
				status: resubmission ? "RESUBMITTED" : "PENDING",
				currentStep: startStep,
				submittedAt: new Date(),
				resubmissionCount: resubmission ? { increment: 1 } : 0,
			};

			if (formType === "TERMINATION") {
				requestData.terminationReasonId = terminationReasonId;
			} else if (formType === "ID_REPLACEMENT") {
				requestData.idReplacementReasonId = idReplacementReasonId;
			} else if (formType === "TEACHER_CLEARANCE") {
				requestData.teacherClearanceReasonId = teacherClearanceReasonId;
			}

			const request = resubmission
				? await tx.clearanceRequest.update({
						where: { id: existingRequest!.id },
						data: {
							...requestData,
							updatedAt: new Date(),
							rejectionReason: null,
						},
				  })
				: await tx.clearanceRequest.create({ data: requestData });

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

			const currentStep = workflowRule.workflowSteps.find(
				(step) => step.stepOrder === startStep
			);
			if (currentStep) {
				const approver = await tx.approver.findFirst({
					where: { officeId: currentStep.officeId },
					include: { user: true },
				});

				if (approver) {
					await tx.approvalAction.upsert({
						where: {
							clearanceRequestId_approverId: {
								clearanceRequestId: request.id,
								approverId: approver.id,
							},
						},
						update: {
							status: "PENDING",
							actionDueBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
							actionDate: null,
							finalizedAt: null,
							comment: null,
						},
						create: {
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
							title: `New ${formType.replace(/_/g, " ")} Request`,
							message: `A new ${formType.replace(
								/_/g,
								" "
							)} request (Reason: ${reasonText}) requires your approval.`,
							type: "ACTION_REQUIRED",
							status: "SENT",
							sentAt: new Date(),
						},
					});
				}
			}

			return request;
		});

		const io = req.app.get("io");
		const notificationId = uuidv4();
		io.to(`user:${userId}`).emit("notification:new", {
			id: notificationId,
			clearanceRequestId: clearanceRequest.id,
			title: `${formType.replace(/_/g, " ")} Request Submitted`,
			message: `Your ${formType.replace(
				/_/g,
				" "
			)} request (Reason: ${reasonText}) has been submitted and is pending approval.`,
			type: "INFO",
			read: false,
			sentAt: new Date(),
		});

		await prisma.notification.create({
			data: {
				id: notificationId,
				userId,
				clearanceRequestId: clearanceRequest.id,
				title: `${formType.replace(/_/g, " ")} Request Submitted`,
				message: `Your ${formType.replace(
					/_/g,
					" "
				)} request (Reason: ${reasonText}) has been submitted and is pending approval.`,
				type: "INFO",
				status: "SENT",
				read: false,
				sentAt: new Date(),
			},
		});

		const currentStep = workflowRule.workflowSteps.find(
			(step) => step.stepOrder === startStep
		);
		if (currentStep) {
			const approver = await prisma.approver.findFirst({
				where: { officeId: currentStep.officeId },
				include: { user: true },
			});

			if (approver) {
				io.to(`user:${approver.userId}`).emit("request:assigned", {
					id: clearanceRequest.id,
					formType,
					reason: reasonText,
					submittedAt: clearanceRequest.submittedAt,
					user: {
						firstName: user.firstName,
						fatherName: user.fatherName,
						grandfatherName: user.grandfatherName,
						department:
							user.role === "STUDENT"
								? user.student?.department.name
								: user.teacher?.department.name,
						program:
							user.role === "STUDENT"
								? {
										type: user.student?.program.type,
										category: user.student?.program.category,
								  }
								: null,
						academicStatus:
							user.role === "STUDENT" ? user.student?.academicStatus : null,
						employmentStatus:
							user.role === "TEACHER" ? user.teacher?.employmentStatus : null,
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
							)} clearance request (Reason: ${reasonText}) has been submitted by ${
							user.firstName
						} ${user.fatherName}.</p>
              <p>Request ID: ${clearanceRequest.id}</p>
              <p>Department: ${
								user.role === "STUDENT"
									? user.student?.department.name
									: user.teacher?.department.name
							}</p>
              <p>Program: ${
								user.role === "STUDENT"
									? `${user.student?.program.type} (${user.student?.program.category})`
									: "N/A"
							}</p>
              <p>Please log in to review the request.</p>
              <p>Thank you,</p>
              <p>Clearance System</p>
            `,
					});
				}
			}
		}

		await prisma.notification.create({
			data: {
				id: uuidv4(),
				userId,
				clearanceRequestId: clearanceRequest.id,
				title: `${formType.replace(/_/g, " ")} Request Submitted`,
				message: `Your ${formType.replace(
					/_/g,
					" "
				)} request (Reason: ${reasonText}) has been submitted and is pending approval.`,
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
          <p>Dear ${user.firstName},</p>
          <p>Your ${formType.replace(
						/_/g,
						" "
					)} clearance request (Reason: ${reasonText}) has been submitted.</p>
          <p>Request ID: ${clearanceRequest.id}</p>
          <p>Department: ${
						user.role === "STUDENT"
							? user.student?.department.name
							: user.teacher?.department.name
					}</p>
          <p>Program: ${
						user.role === "STUDENT"
							? `${user.student?.program.type} (${user.student?.program.category})`
							: "N/A"
					}</p>
          <p>You can track the status in the system.</p>
          <p>Thank you,</p>
          <p>Clearance System</p>
        `,
			});
		}

		res.status(200).json({
			status: "success",
			data: {
				id: clearanceRequest.id,
				formType,
				reason: reasonText,
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
				user: {
					include: {
						student: { include: { department: true, program: true } },
						teacher: { include: { department: true } },
					},
				},
				approvalActions: { include: { approver: true } },
				program: true,
				terminationReason: true,
				idReplacementReason: true,
				teacherClearanceReason: true,
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

		const reasonText =
			clearanceRequest.terminationReason?.reason ||
			clearanceRequest.idReplacementReason?.reason ||
			clearanceRequest.teacherClearanceReason?.reason ||
			"Not specified";

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

			const io = req.app.get("io");

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
						)} request (Reason: ${reasonText}) was rejected by ${
							approver.user.firstName
						} ${approver.user.fatherName}. Reason: ${
							comment || "No reason provided"
						}`,
						type: "ACTION_REQUIRED",
						status: "SENT",
						sentAt: new Date(),
					},
				});

				const notificationId = uuidv4();
				io.to(`user:${clearanceRequest.userId}`).emit("notification:new", {
					id: notificationId,
					clearanceRequestId: requestId,
					title: `${clearanceRequest.formType.replace(
						/_/g,
						" "
					)} Request Rejected`,
					message: `Your ${clearanceRequest.formType.replace(
						/_/g,
						" "
					)} request (Reason: ${reasonText}) was rejected by ${
						approver.user.firstName
					} ${approver.user.fatherName}. Reason: ${
						comment || "No reason provided"
					}`,
					type: "ACTION_REQUIRED",
					read: false,
					sentAt: new Date(),
				});

				io.to(`user:${clearanceRequest.userId}`).emit(
					"request:status-updated",
					{
						id: clearanceRequest.id,
						status: "REJECTED",
						currentStep: clearanceRequest.currentStep,
						reason: reasonText,
						rejectionReason: comment || "No reason provided",
					}
				);

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
							)} request (Reason: ${reasonText}) was rejected by ${
							approver.user.firstName
						} ${approver.user.fatherName}.</p>
              <p>Reason: ${comment || "No reason provided"}</p>
              <p>Department: ${
								clearanceRequest.user.role === "STUDENT"
									? clearanceRequest.user.student?.department.name
									: clearanceRequest.user.teacher?.department.name
							}</p>
              <p>Program: ${
								clearanceRequest.user.role === "STUDENT"
									? `${clearanceRequest.user.student?.program.type} (${clearanceRequest.user.student?.program.category})`
									: "N/A"
							}</p>
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
								title: `New ${clearanceRequest.formType.replace(
									/_/g,
									" "
								)} Request`,
								message: `A new ${clearanceRequest.formType.replace(
									/_/g,
									" "
								)} request (Reason: ${reasonText}) requires your approval.`,
								type: "ACTION_REQUIRED",
								status: "SENT",
								sentAt: new Date(),
							},
						});

						io.to(`user:${nextApprover.userId}`).emit("request:assigned", {
							id: clearanceRequest.id,
							formType: clearanceRequest.formType,
							reason: reasonText,
							submittedAt: clearanceRequest.submittedAt,
							user: {
								firstName: clearanceRequest.user.firstName,
								fatherName: clearanceRequest.user.fatherName,
								grandfatherName: clearanceRequest.user.grandfatherName,
								department:
									clearanceRequest.user.role === "STUDENT"
										? clearanceRequest.user.student?.department.name
										: clearanceRequest.user.teacher?.department.name,
								program:
									clearanceRequest.user.role === "STUDENT"
										? {
												type: clearanceRequest.user.student?.program.type,
												category:
													clearanceRequest.user.student?.program.category,
										  }
										: null,
								academicStatus:
									clearanceRequest.user.role === "STUDENT"
										? clearanceRequest.user.student?.academicStatus
										: null,
								employmentStatus:
									clearanceRequest.user.role === "TEACHER"
										? clearanceRequest.user.teacher?.employmentStatus
										: null,
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
									)} clearance request (Reason: ${reasonText}) has been submitted by ${
									clearanceRequest.user.firstName
								} ${clearanceRequest.user.fatherName}.</p>
                  <p>Request ID: ${requestId}</p>
                  <p>Department: ${
										clearanceRequest.user.role === "STUDENT"
											? clearanceRequest.user.student?.department.name
											: clearanceRequest.user.teacher?.department.name
									}</p>
                  <p>Program: ${
										clearanceRequest.user.role === "STUDENT"
											? `${clearanceRequest.user.student?.program.type} (${clearanceRequest.user.student?.program.category})`
											: "N/A"
									}</p>
                  <p>Please log in to review the request.</p>
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

					io.to(`user:${clearanceRequest.userId}`).emit(
						"request:status-updated",
						{
							id: clearanceRequest.id,
							status: "PENDING",
							currentStep: clearanceRequest.currentStep + 1,
							reason: reasonText,
						}
					);

					// Notify user of approval progress
					await tx.notification.create({
						data: {
							id: uuidv4(),
							userId: clearanceRequest.userId,
							clearanceRequestId: requestId,
							title: `${clearanceRequest.formType.replace(
								/_/g,
								" "
							)} Step Approved`,
							message: `Your ${clearanceRequest.formType.replace(
								/_/g,
								" "
							)} request (Reason: ${reasonText}) has been approved by ${
								approver.user.firstName
							} ${
								approver.user.fatherName
							}. It is now pending approval by the next approver.`,
							type: "INFO",
							status: "SENT",
							sentAt: new Date(),
						},
					});

					const notificationId = uuidv4();
					io.to(`user:${clearanceRequest.userId}`).emit("notification:new", {
						id: notificationId,
						clearanceRequestId: requestId,
						title: `${clearanceRequest.formType.replace(
							/_/g,
							" "
						)} Step Approved`,
						message: `Your ${clearanceRequest.formType.replace(
							/_/g,
							" "
						)} request (Reason: ${reasonText}) has been approved by ${
							approver.user.firstName
						} ${
							approver.user.fatherName
						}. It is now pending approval by the next approver.`,
						type: "INFO",
						read: false,
						sentAt: new Date(),
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
							)} Step Approved`,
							html: `
                <p>Dear ${clearanceRequest.user.firstName},</p>
                <p>Your ${clearanceRequest.formType.replace(
									/_/g,
									" "
								)} request (Reason: ${reasonText}) has been approved by ${
								approver.user.firstName
							} ${approver.user.fatherName}.</p>
                <p>It is now pending approval by the next approver.</p>
                <p>Department: ${
									clearanceRequest.user.role === "STUDENT"
										? clearanceRequest.user.student?.department.name
										: clearanceRequest.user.teacher?.department.name
								}</p>
                <p>Program: ${
									clearanceRequest.user.role === "STUDENT"
										? `${clearanceRequest.user.student?.program.type} (${clearanceRequest.user.student?.program.category})`
										: "N/A"
								}</p>
                <p>Request ID: ${requestId}</p>
                <p>Thank you,</p>
                <p>Clearance System</p>
              `,
						});
					}
				} else {
					await tx.clearanceRequest.update({
						where: { id: requestId },
						data: { status: "COMPLETED" },
					});

					await tx.certificate.create({
						data: {
							id: uuidv4(),
							clearanceRequestId: requestId,
							filePath: `/certificates/${requestId}.pdf`,
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
							)} request (Reason: ${reasonText}) has been fully approved. You can download your certificate.`,
							type: "INFO",
							status: "SENT",
							sentAt: new Date(),
						},
					});

					const notificationId = uuidv4();
					io.to(`user:${clearanceRequest.userId}`).emit("notification:new", {
						id: notificationId,
						clearanceRequestId: requestId,
						title: `${clearanceRequest.formType.replace(
							/_/g,
							" "
						)} Request Approved`,
						message: `Your ${clearanceRequest.formType.replace(
							/_/g,
							" "
						)} request (Reason: ${reasonText}) has been fully approved. You can download your certificate.`,
						type: "INFO",
						read: false,
						sentAt: new Date(),
					});

					io.to(`user:${clearanceRequest.userId}`).emit(
						"request:status-updated",
						{
							id: clearanceRequest.id,
							status: "COMPLETED",
							currentStep: clearanceRequest.currentStep,
							reason: reasonText,
						}
					);

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
								)} request (Reason: ${reasonText}) has been fully approved.</p>
                <p>Department: ${
									clearanceRequest.user.role === "STUDENT"
										? clearanceRequest.user.student?.department.name
										: clearanceRequest.user.teacher?.department.name
								}</p>
                <p>Program: ${
									clearanceRequest.user.role === "STUDENT"
										? `${clearanceRequest.user.student?.program.type} (${clearanceRequest.user.student?.program.category})`
										: "N/A"
								}</p>
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
			res
				.status(403)
				.json({ status: "error", message: "User role not authorized" });
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
			include: {
				program: true,
			},
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

		const io = req.app.get("io");

		// Find the WorkflowStep for the current step to get the correct officeId
		const workflowRule = await prisma.workflowRule.findFirst({
			where: {
				formType: clearanceRequest.formType,
				programId: clearanceRequest.programId || undefined,
			},
			include: {
				workflowSteps: {
					where: { stepOrder: clearanceRequest.currentStep },
					include: { office: true },
				},
			},
		});

		if (workflowRule && workflowRule.workflowSteps.length > 0) {
			const currentStep = workflowRule.workflowSteps[0];
			const approver = await prisma.approver.findFirst({
				where: { officeId: currentStep.officeId },
				include: { user: true },
			});

			if (approver) {
				await prisma.notification.create({
					data: {
						id: uuidv4(),
						userId: approver.userId,
						clearanceRequestId: requestId,
						title: `Document Uploaded for ${clearanceRequest.formType.replace(
							/_/g,
							" "
						)} Request`,
						message: `A document has been uploaded for the ${clearanceRequest.formType.replace(
							/_/g,
							" "
						)} request (ID: ${requestId}). Please review.`,
						type: "ACTION_REQUIRED",
						status: "SENT",
						sentAt: new Date(),
					},
				});

				const notificationId = uuidv4();
				io.to(`user:${approver.userId}`).emit("notification:new", {
					id: notificationId,
					clearanceRequestId: requestId,
					title: `Document Uploaded for ${clearanceRequest.formType.replace(
						/_/g,
						" "
					)} Request`,
					message: `A document has been uploaded for the ${clearanceRequest.formType.replace(
						/_/g,
						" "
					)} request (ID: ${requestId}). Please review.`,
					type: "ACTION_REQUIRED",
					read: false,
					sentAt: new Date(),
				});
			}
		}

		res.status(200).json({ status: "success", data: document });
	} catch (error) {
		console.error("Error uploading document:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};

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

export const generateClearanceCertificate = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { requestId } = req.params;
		const clearanceRequest = await prisma.clearanceRequest.findUnique({
			where: { id: requestId },
			include: {
				user: {
					include: {
						student: { include: { department: true, program: true } },
						teacher: { include: { department: true } },
					},
				},
				terminationReason: true,
				idReplacementReason: true,
				teacherClearanceReason: true,
			},
		});

		if (!clearanceRequest) {
			res
				.status(404)
				.json({ status: "error", message: "Clearance request not found" });
			return;
		}

		if (clearanceRequest.status !== "COMPLETED") {
			res
				.status(400)
				.json({ status: "error", message: "Request not completed" });
			return;
		}

		const certificate = await prisma.certificate.findUnique({
			where: { clearanceRequestId: requestId },
		});

		if (!certificate) {
			res
				.status(404)
				.json({ status: "error", message: "Certificate not found" });
			return;
		}

		const reasonText =
			clearanceRequest.terminationReason?.reason ||
			clearanceRequest.idReplacementReason?.reason ||
			clearanceRequest.teacherClearanceReason?.reason ||
			"Not specified";

		const doc = new PDFDocument();
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=clearance-${requestId}.pdf`
		);

		doc.pipe(res);
		doc.fontSize(20).text("Debre Markos University Clearance Certificate", {
			align: "center",
		});
		doc.moveDown();
		doc
			.fontSize(14)
			.text(
				`Name: ${clearanceRequest.user.firstName} ${clearanceRequest.user.fatherName}`
			);
		doc.text(
			`Department: ${
				clearanceRequest.user.role === "STUDENT"
					? clearanceRequest.user.student?.department.name
					: clearanceRequest.user.teacher?.department.name
			}`
		);
		doc.text(
			`Program: ${
				clearanceRequest.user.role === "STUDENT"
					? `${clearanceRequest.user.student?.program.type} (${clearanceRequest.user.student?.program.category})`
					: "N/A"
			}`
		);
		doc.text(`Request Type: ${clearanceRequest.formType.replace(/_/g, " ")}`);
		doc.text(`Reason: ${reasonText}`);
		doc.text(`Issued: ${new Date(certificate.issuedAt).toLocaleDateString()}`);
		doc.text(`QR Code: ${certificate.qrCode}`);
		doc.end();
	} catch (error) {
		console.error("Error generating certificate:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};
export const getDeadlines = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: userId } = req.user;
		// Mock deadlines or fetch from a deadlines table if implemented
		const deadlines = [
			{
				id: uuidv4(),
				title: "Graduation Clearance Deadline",
				dueDate: new Date("2025-05-15"),
			},
			{
				id: uuidv4(),
				title: "Document Submission Deadline",
				dueDate: new Date("2025-06-01"),
			},
		].filter((d) => d.dueDate > new Date());

		res.status(200).json({ status: "success", data: deadlines });
	} catch (error) {
		console.error("Error fetching deadlines:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};
export const markNotificationAsRead = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: userId } = req.user;
		const { notificationId } = req.body;

		const notification = await prisma.notification.findUnique({
			where: { id: notificationId, userId },
		});

		if (!notification) {
			res
				.status(404)
				.json({ status: "error", message: "Notification not found" });
			return;
		}

		await prisma.notification.update({
			where: { id: notificationId },
			data: { read: true, status: "READ" },
		});

		res
			.status(200)
			.json({ status: "success", message: "Notification marked as read" });
	} catch (error) {
		console.error("Error marking notification as read:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};
export const markAllNotificationsAsRead = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: userId } = req.user;

		await prisma.notification.updateMany({
			where: { userId, read: false },
			data: { read: true, status: "READ" },
		});

		res
			.status(200)
			.json({ status: "success", message: "All notifications marked as read" });
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};
export const sendSystemMaintenanceNotification = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { message, scheduledAt } = req.body;
		const { id: adminId } = req.user;

		const admin = await prisma.user.findUnique({
			where: { id: adminId, role: "ADMIN" },
		});

		if (!admin) {
			res.status(403).json({ status: "error", message: "Not an admin" });
			return;
		}

		const users = await prisma.user.findMany({
			where: { role: { in: ["STUDENT", "TEACHER", "APPROVER"] } },
		});

		const notifications = await prisma.$transaction(
			users.map((user) =>
				prisma.notification.create({
					data: {
						id: uuidv4(),
						userId: user.id,
						title: "System Maintenance Scheduled",
						message: `System maintenance is scheduled for ${new Date(
							scheduledAt
						).toLocaleString()}. ${message}`,
						type: "SYSTEM",
						status: "SENT",
						read: false,
						sentAt: new Date(),
					},
				})
			)
		);

		const io = req.app.get("io");
		users.forEach((user, index) => {
			io.to(`user:${user.id}`).emit("notification:new", {
				id: notifications[index].id,
				title: "System Maintenance Scheduled",
				message: `System maintenance is scheduled for ${new Date(
					scheduledAt
				).toLocaleString()}. ${message}`,
				type: "SYSTEM",
				read: false,
				sentAt: new Date(),
			});
		});

		res.status(200).json({
			status: "success",
			message: "System maintenance notifications sent",
		});
	} catch (error) {
		console.error("Error sending system maintenance notification:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};
export const getNotifications = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id: userId } = req.user;
		const notifications = await prisma.notification.findMany({
			where: { userId },
			orderBy: { sentAt: "desc" },
			select: {
				id: true,
				title: true,
				message: true,
				type: true,
				read: true,
				sentAt: true,
				clearanceRequestId: true,
			},
		});

		res.status(200).json({ status: "success", data: notifications });
	} catch (error) {
		console.error("Error fetching notifications:", error);
		res.status(500).json({ status: "error", message: "Internal server error" });
	} finally {
		await prisma.$disconnect();
	}
};
