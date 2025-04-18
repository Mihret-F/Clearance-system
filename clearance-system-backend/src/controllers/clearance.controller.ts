import { Request, Response } from "express";
import { prisma } from "../server";
import { FormType } from "../../generated/prisma";

// Create a new clearance request
export const createClearanceRequest = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user.id;
		const {
			formType,
			programId,
			terminationReasonId,
			idReplacementReasonId,
			teacherReason,
		} = req.body;

		// Create the clearance request
		const clearanceRequest = await prisma.clearanceRequest.create({
			data: {
				userId,
				formType,
				programId,
				terminationReasonId,
				idReplacementReasonId,
				teacherReason,
				status: "PENDING",
				currentStep: 1,
			},
		});

		// Create notification for the user
		await prisma.notification.create({
			data: {
				userId,
				requestId: clearanceRequest.id,
				message: `Your ${formType.toLowerCase()} clearance request has been submitted successfully.`,
				status: "SENT",
			},
		});

		// Find the first approver in the workflow
		// Get the workflow rule based on form type and program
		const workflowRule = await prisma.workflowRule.findFirst({
			where: {
				formType,
				programId: programId || undefined,
			},
			include: {
				workflowSteps: {
					where: {
						stepOrder: 1,
					},
					include: {
						office: true,
					},
				},
			},
		});

		if (workflowRule && workflowRule.workflowSteps.length > 0) {
			const firstStep = workflowRule.workflowSteps[0];

			// Find approvers for the first office
			const approvers = await prisma.approver.findMany({
				where: {
					officeId: firstStep.officeId,
				},
				include: {
					user: true,
				},
			});

			// Notify all approvers in the first office
			for (const approver of approvers) {
				await prisma.notification.create({
					data: {
						userId: approver.userId,
						requestId: clearanceRequest.id,
						message: `A new ${formType.toLowerCase()} clearance request requires your approval.`,
						status: "SENT",
					},
				});
			}
		}

		res.status(201).json({
			status: "success",
			data: clearanceRequest,
			message: "Clearance request created successfully",
		});
		return;
	} catch (error) {
		console.error("Create clearance request error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while creating the clearance request",
		});
		return;
	}
};

// Get all clearance requests for a user
export const getClearanceRequests = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user.id;
		const userRole = req.user.role;

		let clearanceRequests;

		if (userRole === "STUDENT" || userRole === "TEACHER") {
			// If user is a student or teacher, get their own requests
			clearanceRequests = await prisma.clearanceRequest.findMany({
				where: {
					userId,
				},
				include: {
					terminationReason: true,
					idReplacementReason: true,
					approvalActions: {
						include: {
							approver: {
								include: {
									office: true,
								},
							},
						},
					},
				},
				orderBy: {
					submittedAt: "desc",
				},
			});
		} else if (userRole === "APPROVER") {
			// If user is an approver, get requests that need their approval
			const approver = await prisma.approver.findUnique({
				where: {
					userId,
				},
			});

			if (!approver) {
				res.status(404).json({
					status: "error",
					message: "Approver profile not found",
				});
				return;
			}

			// Get workflow steps for this approver's office
			const workflowSteps = await prisma.workflowStep.findMany({
				where: {
					officeId: approver.officeId,
				},
				include: {
					workflowRule: true,
				},
			});

			// Get requests that match the workflow rules and are at the current step
			// Update the map function to explicitly type `step`
			clearanceRequests = await prisma.clearanceRequest.findMany({
				where: {
					OR: workflowSteps.map(
						(step: {
							workflowRule: { formType: string; programId: string | null };
							stepOrder: number;
						}) => ({
							formType: step.workflowRule.formType as FormType, // Cast to FormType
							programId: step.workflowRule.programId,
							currentStep: step.stepOrder,
							status: "PENDING",
						})
					),
				},
				include: {
					user: {
						select: {
							id: true,
							username: true,
							firstName: true,
							fatherName: true,
							grandfatherName: true,
							student: true,
							teacher: true,
						},
					},
					terminationReason: true,
					idReplacementReason: true,
					approvalActions: {
						include: {
							approver: {
								include: {
									office: true,
								},
							},
						},
					},
				},
				orderBy: {
					submittedAt: "desc",
				},
			});
		} else if (userRole === "ADMIN") {
			// If user is an admin, get all requests
			clearanceRequests = await prisma.clearanceRequest.findMany({
				include: {
					user: {
						select: {
							id: true,
							username: true,
							firstName: true,
							fatherName: true,
							grandfatherName: true,
							student: true,
							teacher: true,
						},
					},
					terminationReason: true,
					idReplacementReason: true,
					approvalActions: {
						include: {
							approver: {
								include: {
									office: true,
								},
							},
						},
					},
				},
				orderBy: {
					submittedAt: "desc",
				},
			});
		} else {
			res.status(403).json({
				status: "error",
				message: "Unauthorized access",
			});
			return;
		}

		res.status(200).json({
			status: "success",
			data: clearanceRequests,
		});
		return;
	} catch (error) {
		console.error("Get clearance requests error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching clearance requests",
		});
		return;
	}
};

// Get a specific clearance request by ID
export const getClearanceRequestById = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.user.id;
		const userRole = req.user.role;

		const clearanceRequest = await prisma.clearanceRequest.findUnique({
			where: {
				id,
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
						firstName: true,
						fatherName: true,
						grandfatherName: true,
						student: true,
						teacher: true,
					},
				},
				terminationReason: true,
				idReplacementReason: true,
				approvalActions: {
					include: {
						approver: {
							include: {
								office: true,
								user: {
									select: {
										firstName: true,
										fatherName: true,
									},
								},
							},
						},
					},
					orderBy: {
						actionDate: "asc",
					},
				},
				documents: {
					include: {
						documentType: true,
					},
				},
			},
		});

		if (!clearanceRequest) {
			res.status(404).json({
				status: "error",
				message: "Clearance request not found",
			});
			return;
		}

		// Check if user has permission to view this request
		if (
			userRole !== "ADMIN" &&
			userId !== clearanceRequest.userId &&
			userRole === "APPROVER"
		) {
			// If user is an approver, check if they are in the workflow
			const approver = await prisma.approver.findUnique({
				where: {
					userId,
				},
			});

			if (!approver) {
				res.status(403).json({
					status: "error",
					message: "Unauthorized access",
				});
				return;
			}

			// Get workflow for this request
			const workflowRule = await prisma.workflowRule.findFirst({
				where: {
					formType: clearanceRequest.formType,
					programId: clearanceRequest.programId || undefined,
				},
				include: {
					workflowSteps: {
						where: {
							officeId: approver.officeId,
						},
					},
				},
			});

			if (!workflowRule || workflowRule.workflowSteps.length === 0) {
				res.status(403).json({
					status: "error",
					message: "Unauthorized access",
				});
				return;
			}
		}

		res.status(200).json({
			status: "success",
			data: clearanceRequest,
		});
		return;
	} catch (error) {
		console.error("Get clearance request error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching the clearance request",
		});
		return;
	}
};

// Upload a document for a clearance request
export const uploadDocument = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const { documentTypeId, filePath } = req.body;
		const userId = req.user.id;

		// Check if the clearance request exists and belongs to the user
		const clearanceRequest = await prisma.clearanceRequest.findUnique({
			where: {
				id,
				userId,
			},
		});

		if (!clearanceRequest) {
			res.status(404).json({
				status: "error",
				message: "Clearance request not found or unauthorized",
			});
			return;
		}

		// Create the document
		const document = await prisma.document.create({
			data: {
				requestId: id,
				documentTypeId,
				filePath,
			},
		});

		res.status(201).json({
			status: "success",
			data: document,
			message: "Document uploaded successfully",
		});
		return;
	} catch (error) {
		console.error("Upload document error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while uploading the document",
		});
		return;
	}
};
