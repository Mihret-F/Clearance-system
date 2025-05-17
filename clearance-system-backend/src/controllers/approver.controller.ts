import { Request, Response } from "express";
import { prisma } from "../server";
import {
	FormType,
	ApprovalStatus,
	NotificationType,
	NotificationStatus,
} from "../../generated/prisma";

// Get pending requests for an approver
export const getPendingRequests = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user.id;

		// Get approver details
		const approver = await prisma.approver.findUnique({
			where: {
				userId,
			},
			include: {
				office: true,
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
		const pendingRequests = await prisma.clearanceRequest.findMany({
			where: {
				OR: workflowSteps.map(
					(step: {
						workflowRule: { formType: FormType; programId: string | null };
						stepOrder: number;
					}) => ({
						formType: step.workflowRule.formType,
						programId: step.workflowRule.programId || undefined, // Convert null to undefined
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
				teacherClearanceReason: true,
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

		res.status(200).json({
			status: "success",
			data: pendingRequests,
		});
		return;
	} catch (error) {
		console.error("Get pending requests error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching pending requests",
		});
		return;
	}
};

// Approve a clearance request
export const approveRequest = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const { comment } = req.body;
		const userId = req.user.id;

		// Get approver details
		const approver = await prisma.approver.findUnique({
			where: {
				userId,
			},
			include: {
				office: true,
			},
		});

		if (!approver) {
			res.status(404).json({
				status: "error",
				message: "Approver profile not found",
			});
			return;
		}

		// Get the clearance request
		const clearanceRequest = await prisma.clearanceRequest.findUnique({
			where: {
				id,
			},
		});

		if (!clearanceRequest) {
			res.status(404).json({
				status: "error",
				message: "Clearance request not found",
			});
			return;
		}

		// Get the workflow rule for this request
		const workflowRule = await prisma.workflowRule.findFirst({
			where: {
				formType: clearanceRequest.formType,
				programId: clearanceRequest.programId || undefined,
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
				message: "Workflow rule not found for this request",
			});
			return;
		}

		// Check if this approver is authorized for the current step
		const currentStepIndex = clearanceRequest.currentStep - 1;
		if (currentStepIndex >= workflowRule.workflowSteps.length) {
			res.status(400).json({
				status: "error",
				message: "Invalid workflow step",
			});
			return;
		}

		const currentStep = workflowRule.workflowSteps[currentStepIndex];
		if (currentStep.officeId !== approver.officeId) {
			res.status(403).json({
				status: "error",
				message:
					"You are not authorized to approve this request at the current step",
			});
			return;
		}

		// Create approval action
		await prisma.approvalAction.create({
			data: {
				clearanceRequestId: id,
				approverId: approver.id,
				status: "APPROVED",
				comment,
				actionDate: new Date(),
				finalizedAt: new Date(),
			},
		});

		// Check if this is the last step
		const isLastStep =
			currentStepIndex === workflowRule.workflowSteps.length - 1;

		// Update the request status and current step
		const updatedRequest = await prisma.clearanceRequest.update({
			where: {
				id,
			},
			data: {
				status: isLastStep ? "COMPLETED" : "PENDING",
				currentStep: isLastStep
					? clearanceRequest.currentStep
					: clearanceRequest.currentStep + 1,
			},
		});

		// Create notification for the requester
		await prisma.notification.create({
			data: {
				userId: clearanceRequest.userId,
				clearanceRequestId: id,
				title: isLastStep
					? "Clearance Request Completed"
					: "Clearance Request Approved",
				message: isLastStep
					? `Your clearance request has been fully approved and completed.`
					: `Your clearance request has been approved by ${approver.office.name} and moved to the next step.`,
				type: NotificationType.INFO,
				status: NotificationStatus.SENT,
			},
		});

		// If not the last step, notify the next approver(s)
		if (!isLastStep) {
			const nextStep = workflowRule.workflowSteps[currentStepIndex + 1];

			// Find approvers for the next office
			const nextApprovers = await prisma.approver.findMany({
				where: {
					officeId: nextStep.officeId,
				},
				include: {
					user: true,
				},
			});

			// Notify all approvers in the next office
			for (const nextApprover of nextApprovers) {
				await prisma.notification.create({
					data: {
						userId: nextApprover.userId,
						clearanceRequestId: id,
						title: "Action Required: New Clearance Request",
						message: `A clearance request requires your approval.`,
						type: NotificationType.ACTION_REQUIRED,
						status: NotificationStatus.SENT,
					},
				});
			}
		}

		res.status(200).json({
			status: "success",
			data: updatedRequest,
			message: "Request approved successfully",
		});
		return;
	} catch (error) {
		console.error("Approve request error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while approving the request",
		});
		return;
	}
};

// Reject a clearance request
export const rejectRequest = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const { comment } = req.body;
		const userId = req.user.id;

		if (!comment) {
			res.status(400).json({
				status: "error",
				message: "Rejection reason is required",
			});
			return;
		}

		// Get approver details
		const approver = await prisma.approver.findUnique({
			where: {
				userId,
			},
			include: {
				office: true,
			},
		});

		if (!approver) {
			res.status(404).json({
				status: "error",
				message: "Approver profile not found",
			});
			return;
		}

		// Get the clearance request
		const clearanceRequest = await prisma.clearanceRequest.findUnique({
			where: {
				id,
			},
		});

		if (!clearanceRequest) {
			res.status(404).json({
				status: "error",
				message: "Clearance request not found",
			});
			return;
		}

		// Get the workflow rule for this request
		const workflowRule = await prisma.workflowRule.findFirst({
			where: {
				formType: clearanceRequest.formType,
				programId: clearanceRequest.programId || undefined,
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
				message: "Workflow rule not found for this request",
			});
			return;
		}

		// Check if this approver is authorized for the current step
		const currentStepIndex = clearanceRequest.currentStep - 1;
		if (currentStepIndex >= workflowRule.workflowSteps.length) {
			res.status(400).json({
				status: "error",
				message: "Invalid workflow step",
			});
			return;
		}

		const currentStep = workflowRule.workflowSteps[currentStepIndex];
		if (currentStep.officeId !== approver.officeId) {
			res.status(403).json({
				status: "error",
				message:
					"You are not authorized to reject this request at the current step",
			});
			return;
		}

		// Create rejection action
		await prisma.approvalAction.create({
			data: {
				clearanceRequestId: id,
				approverId: approver.id,
				status: "REJECTED",
				comment,
				actionDate: new Date(),
				finalizedAt: new Date(),
			},
		});

		// Update the request status
		const updatedRequest = await prisma.clearanceRequest.update({
			where: {
				id,
			},
			data: {
				status: "REJECTED",
				rejectionReason: comment,
			},
		});

		// Create notification for the requester
		await prisma.notification.create({
			data: {
				userId: clearanceRequest.userId,
				clearanceRequestId: id,
				title: "Clearance Request Rejected",
				message: `Your clearance request has been rejected by ${approver.office.name}. Reason: ${comment}`,
				type: NotificationType.INFO,
				status: NotificationStatus.SENT,
			},
		});

		res.status(200).json({
			status: "success",
			data: updatedRequest,
			message: "Request rejected successfully",
		});
		return;
	} catch (error) {
		console.error("Reject request error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while rejecting the request",
		});
		return;
	}
};
