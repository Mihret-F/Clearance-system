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

		// Get all clearance requests for this user, ordered by submission date (newest first)
		const requests = await prisma.clearanceRequest.findMany({
			where: { userId },
			orderBy: { submittedAt: "desc" },
			include: {
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
										grandfatherName: true,
									},
								},
							},
						},
					},
				},
			},
		});

		res.status(200).json({
			status: "success",
			data: requests,
		});
	} catch (error) {
		console.error("Get clearance requests error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching clearance requests",
		});
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

// Get workflow for a specific request
export const getRequestWorkflow = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { requestId } = req.params;
		const userId = req.user.id;

		// First check if this request belongs to the user
		const request = await prisma.clearanceRequest.findFirst({
			where: {
				id: requestId,
				userId,
			},
		});

		if (!request) {
			res.status(404).json({
				status: "error",
				message: "Request not found or you don't have permission to view it",
			});
			return;
		}

		// Get the workflow rule for this request
		const workflowRule = await prisma.workflowRule.findFirst({
			where: {
				formType: request.formType,
				programId: request.programId || null,
			},
			include: {
				workflowSteps: {
					include: {
						office: true,
					},
					orderBy: {
						stepOrder: "asc",
					},
				},
			},
		});

		if (!workflowRule) {
			res.status(404).json({
				status: "error",
				message: "Workflow not found for this request",
			});
			return;
		}

		// Get approval actions for this request
		const approvalActions = await prisma.approvalAction.findMany({
			where: { requestId },
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
				stepOrder: "asc",
			},
		});

		// Map workflow steps with their status
		const steps = workflowRule.workflowSteps.map((step) => {
			const action = approvalActions.find(
				(action) => action.stepOrder === step.stepOrder
			);

			return {
				id: step.id,
				officeName: step.office.officeName,
				stepOrder: step.stepOrder,
				description: step.description,
				status: action
					? action.status
					: step.stepOrder < request.currentStep
					? "APPROVED"
					: step.stepOrder === request.currentStep
					? "PENDING"
					: "WAITING",
			};
		});

		// Calculate overall progress
		const totalSteps = steps.length;
		const completedSteps = steps.filter(
			(step) => step.status === "APPROVED"
		).length;
		const progress =
			totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

		res.status(200).json({
			status: "success",
			data: {
				steps,
				currentStep: request.currentStep,
				totalSteps,
				progress,
			},
		});
	} catch (error) {
		console.error("Get request workflow error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching request workflow",
		});
	}
};

// Get documents for a specific request
export const getRequestDocuments = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { requestId } = req.params;
		const userId = req.user.id;

		// First check if this request belongs to the user
		const request = await prisma.clearanceRequest.findFirst({
			where: {
				id: requestId,
				userId,
			},
		});

		if (!request) {
			res.status(404).json({
				status: "error",
				message: "Request not found or you don't have permission to view it",
			});
			return;
		}

		// Get all documents for this request
		const documents = await prisma.document.findMany({
			where: { requestId },
			include: {
				documentType: true,
			},
		});

		// Get required document types for this form type
		const requiredDocTypes = await prisma.documentType.findMany();

		// Map to show which documents are submitted and which are pending
		const documentStatus = requiredDocTypes.map((docType) => {
			const submittedDoc = documents.find(
				(doc) => doc.documentTypeId === docType.id
			);

			return {
				id: docType.id,
				name: docType.name,
				description: docType.description,
				status: submittedDoc ? "submitted" : "pending",
				filePath: submittedDoc?.filePath || null,
			};
		});

		res.status(200).json({
			status: "success",
			data: documentStatus,
		});
	} catch (error) {
		console.error("Get request documents error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching request documents",
		});
	}
};

// Get form types (enum values)
export const getFormTypes = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Since FormType is an enum, we return the possible values
		const formTypes = Object.values(FormType);

		res.status(200).json({
			status: "success",
			data: formTypes.map((type: FormType) => ({
				value: type,
				label: type
					.replace(/_/g, " ")
					.replace(/\b\w/g, (l: string) => l.toUpperCase()),
			})),
		});
	} catch (error) {
		console.error("Get form types error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching form types",
		});
	}
};

// Get termination reasons
export const getTerminationReasons = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const reasons = await prisma.terminationReason.findMany();

		res.status(200).json({
			status: "success",
			data: reasons,
		});
	} catch (error) {
		console.error("Get termination reasons error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching termination reasons",
		});
	}
};

// Get ID replacement reasons
export const getIdReplacementReasons = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const reasons = await prisma.idReplacementReason.findMany();

		res.status(200).json({
			status: "success",
			data: reasons,
		});
	} catch (error) {
		console.error("Get ID replacement reasons error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching ID replacement reasons",
		});
	}
};

// Get document types
export const getDocumentTypes = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const documentTypes = await prisma.documentType.findMany();

		res.status(200).json({
			status: "success",
			data: documentTypes,
		});
	} catch (error) {
		console.error("Get document types error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching document types",
		});
	}
};

// Submit clearance request
export const submitClearanceRequest = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user.id;
		const {
			formType,
			terminationReasonId,
			idReplacementReasonId,
			teacherReason,
		} = req.body;

		console.log("Request body:", req.body);

		// Get user details to determine program
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				student: true,
				teacher: true,
			},
		});

		if (!user) {
			res.status(404).json({
				status: "error",
				message: "User not found",
			});
			return;
		}

		// Validate request type based on user role
		if (
			(user.role === "STUDENT" && formType === "TEACHER_CLEARANCE") ||
			(user.role === "TEACHER" &&
				(formType === "TERMINATION" || formType === "ID_REPLACEMENT"))
		) {
			res.status(400).json({
				status: "error",
				message: "Invalid request type for your role",
			});
			return;
		}

		// Determine program ID based on user type
		let programId = null;
		if (user.role === "STUDENT" && user.student) {
			programId = user.student.programId;
		}

		// Find the workflow rule for this request type and program
		const workflowRule = await prisma.workflowRule.findFirst({
			where: {
				formType: formType as FormType,
				programId: programId,
			},
			include: {
				workflowSteps: {
					orderBy: {
						stepOrder: "asc",
					},
				},
			},
		});

		if (!workflowRule) {
			res.status(404).json({
				status: "error",
				message: "No workflow defined for this request type and program",
			});
			return;
		}

		// Validate foreign keys before creating the request
		if (terminationReasonId) {
			const terminationReason = await prisma.terminationReason.findUnique({
				where: { id: terminationReasonId },
			});

			if (!terminationReason) {
				res.status(400).json({
					status: "error",
					message: "Invalid termination reason",
				});
				return;
			}
		}

		if (idReplacementReasonId) {
			const idReplacementReason = await prisma.idReplacementReason.findUnique({
				where: { id: idReplacementReasonId },
			});

			if (!idReplacementReason) {
				res.status(400).json({
					status: "error",
					message: "Invalid ID replacement reason",
				});
				return;
			}
		}

		// Create the clearance request with null for any undefined foreign keys
		const clearanceRequest = await prisma.clearanceRequest.create({
			data: {
				userId,
				formType: formType as FormType,
				programId: programId || undefined,
				terminationReasonId: terminationReasonId || undefined,
				idReplacementReasonId: idReplacementReasonId || undefined,
				teacherReason: teacherReason || undefined,
				status: "PENDING",
				currentStep: 1,
			},
		});

		// Handle file uploads
		if (req.files && Array.isArray(req.files)) {
			for (const file of req.files) {
				// Get document type ID from the file field name or use a default
				let documentTypeId = file.fieldname;
				if (documentTypeId === "documents") {
					// If no specific document type, use a default one
					const defaultDocType = await prisma.documentType.findFirst();
					if (defaultDocType) {
						documentTypeId = defaultDocType.id;
					} else {
						console.warn("No document type found for uploaded file");
						continue;
					}
				}

				await prisma.document.create({
					data: {
						requestId: clearanceRequest.id,
						documentTypeId,
						filePath: file.path,
					},
				});
			}
		}

		// Create notification for the user
		await prisma.notification.create({
			data: {
				userId,
				requestId: clearanceRequest.id,
				message: `Your ${formType
					.replace(/_/g, " ")
					.toLowerCase()} request has been submitted successfully.`,
				status: "SENT",
			},
		});

		// Find the first approver in the workflow
		if (workflowRule.workflowSteps.length > 0) {
			const firstStep = workflowRule.workflowSteps[0];

			// Find an approver for this office
			const approver = await prisma.approver.findFirst({
				where: {
					officeId: firstStep.officeId,
				},
			});

			if (approver) {
				// Create notification for the approver
				await prisma.notification.create({
					data: {
						userId: approver.userId,
						requestId: clearanceRequest.id,
						message: `A new ${formType
							.replace(/_/g, " ")
							.toLowerCase()} request requires your approval.`,
						status: "SENT",
					},
				});
			}
		}

		res.status(201).json({
			status: "success",
			message: "Clearance request submitted successfully",
			data: clearanceRequest,
		});
	} catch (error) {
		console.error("Submit clearance request error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while submitting clearance request",
		});
	}
};

// Get user notifications
export const getUserNotifications = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user.id;

		// Get notifications for this user, ordered by creation date (newest first)
		const notifications = await prisma.notification.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
			include: {
				request: true,
			},
			take: 10, // Limit to 10 most recent notifications
		});

		// Format notifications for frontend
		const formattedNotifications = notifications.map((notification) => {
			// Calculate time ago
			const createdAt = new Date(notification.createdAt);
			const now = new Date();
			const diffInSeconds = Math.floor(
				(now.getTime() - createdAt.getTime()) / 1000
			);

			let timeAgo;
			if (diffInSeconds < 60) {
				timeAgo = `${diffInSeconds} seconds ago`;
			} else if (diffInSeconds < 3600) {
				timeAgo = `${Math.floor(diffInSeconds / 60)} minutes ago`;
			} else if (diffInSeconds < 86400) {
				timeAgo = `${Math.floor(diffInSeconds / 3600)} hours ago`;
			} else if (diffInSeconds < 604800) {
				timeAgo = `${Math.floor(diffInSeconds / 86400)} days ago`;
			} else {
				timeAgo = createdAt.toLocaleDateString();
			}

			// Determine notification type
			let type = "info";
			if (notification.message.includes("approved")) {
				type = "success";
			} else if (notification.message.includes("rejected")) {
				type = "warning";
			} else if (notification.message.includes("pending")) {
				type = "pending";
			}

			return {
				id: notification.id,
				title: notification.message.split(".")[0],
				message: notification.message,
				time: timeAgo,
				read: notification.status === "READ",
				type,
				requestId: notification.requestId,
			};
		});

		res.status(200).json({
			status: "success",
			data: formattedNotifications,
		});
	} catch (error) {
		console.error("Get user notifications error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching notifications",
		});
	}
};
// Upload document for a clearance request
export const uploadDocument = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user.id;
		const { requestId, documentTypeId, description } = req.body;
		const file = req.file;

		if (!file) {
			res.status(400).json({
				status: "error",
				message: "No file uploaded",
			});
			return;
		}

		// Check if the request belongs to the user
		const request = await prisma.clearanceRequest.findFirst({
			where: {
				id: requestId,
				userId,
			},
		});

		if (!request) {
			res.status(404).json({
				status: "error",
				message: "Request not found or you don't have permission to modify it",
			});
			return;
		}

		// Check if document type exists
		const documentType = await prisma.documentType.findUnique({
			where: { id: documentTypeId },
		});

		if (!documentType) {
			res.status(404).json({
				status: "error",
				message: "Document type not found",
			});
			return;
		}

		// Check if document already exists for this request and type
		const existingDocument = await prisma.document.findFirst({
			where: {
				requestId,
				documentTypeId,
			},
		});

		// If document exists, update it
		if (existingDocument) {
			await prisma.document.update({
				where: { id: existingDocument.id },
				data: {
					filePath: file.path,
					uploadedAt: new Date(),
				},
			});
		} else {
			// Create new document
			await prisma.document.create({
				data: {
					requestId,
					documentTypeId,
					filePath: file.path,
				},
			});
		}

		// Create notification for the user
		await prisma.notification.create({
			data: {
				userId,
				requestId,
				message: `Document "${documentType.name}" has been uploaded successfully.`,
				status: "SENT",
			},
		});

		res.status(200).json({
			status: "success",
			message: "Document uploaded successfully",
		});
	} catch (error) {
		console.error("Upload document error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while uploading document",
		});
	}
};
