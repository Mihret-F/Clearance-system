import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../server";

// Get all users
export const getAllUsers = async (
	// Removed unused 'req' parameter
	res: Response
): Promise<void> => {
	try {
		const users = await prisma.user.findMany({
			include: {
				student: true,
				teacher: true,
				approver: {
					include: {
						office: true,
						department: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		res.status(200).json({
			status: "success",
			data: users,
		});
		return;
	} catch (error) {
		console.error("Get all users error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching users",
		});
		return;
	}
};

// Create a new user
export const createUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const {
			username,
			password,
			firstName,
			fatherName,
			grandfatherName,
			email,
			role,
			studentData,
			teacherData,
			approverData,
		} = req.body || {};

		// Check if username already exists
		const existingUser = await prisma.user.findUnique({
			where: {
				username,
			},
		});

		if (existingUser) {
			res.status(400).json({
				status: "error",
				message: "Username already exists",
			});
			return;
		}

		// Check if email already exists (if provided)
		if (email) {
			const existingEmail = await prisma.user.findFirst({
				where: {
					email,
				},
			});

			if (existingEmail) {
				res.status(400).json({
					status: "error",
					message: "Email already exists",
				});
				return;
			}
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the user with role-specific data
		const user = await prisma.user.create({
			data: {
				username,
				passwordHash: hashedPassword,
				firstName,
				fatherName,
				grandfatherName,
				email,
				role,
				status: "ACTIVE",
				isFirstLogin: true,
				student:
					role === "STUDENT" && studentData
						? {
								create: {
									startDate: new Date(studentData.startDate),
									programId: studentData.programId,
									currentYear: studentData.currentYear,
									semester: studentData.semester,
									academicStatus: studentData.academicStatus,
								},
						  }
						: undefined,
				teacher:
					role === "TEACHER" && teacherData
						? {
								create: {
									hireDate: new Date(teacherData.hireDate),
									position: teacherData.position,
									departmentId: teacherData.departmentId,
									employmentStatus: teacherData.employmentStatus,
								},
						  }
						: undefined,
				approver:
					role === "APPROVER" && approverData
						? {
								create: {
									officeId: approverData.officeId,
									departmentId: approverData.departmentId,
									// Removed 'position' as it does not exist in the type
								},
						  }
						: undefined,
			},
			include: {
				student: true,
				teacher: true,
				approver: {
					include: {
						office: true,
						department: true,
					},
				},
			},
		});

		res.status(201).json({
			status: "success",
			data: user,
			message: "User created successfully",
		});
		return;
	} catch (error) {
		console.error("Create user error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while creating the user",
		});
		return;
	}
};

// Update a user
export const updateUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const {
			firstName,
			fatherName,
			grandfatherName,
			email,
			status,
			studentData,
			teacherData,
			approverData,
		} = req.body;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: {
				id,
			},
		});

		if (!existingUser) {
			res.status(404).json({
				status: "error",
				message: "User not found",
			});
			return;
		}

		// Check if email already exists (if provided and changed)
		if (email && email !== existingUser.email) {
			const existingEmail = await prisma.user.findFirst({
				where: {
					email,
					id: { not: id },
				},
			});

			if (existingEmail) {
				res.status(400).json({
					status: "error",
					message: "Email already exists",
				});
				return;
			}
		}

		// Update the user
		await prisma.user.update({
			where: {
				id,
			},
			data: {
				firstName,
				fatherName,
				grandfatherName,
				email,
				status,
			},
			include: {
				student: true,
				teacher: true,
				approver: {
					include: {
						office: true,
						department: true,
					},
				},
			},
		});

		// Update role-specific data if provided
		if (existingUser.role === "STUDENT" && studentData) {
			await prisma.student.update({
				where: {
					userId: id,
				},
				data: {
					programId: studentData.programId,
					currentYear: studentData.currentYear,
					semester: studentData.semester,
					academicStatus: studentData.academicStatus,
				},
			});
		} else if (existingUser.role === "TEACHER" && teacherData) {
			await prisma.teacher.update({
				where: {
					userId: id,
				},
				data: {
					position: teacherData.position,
					departmentId: teacherData.departmentId,
					employmentStatus: teacherData.employmentStatus,
				},
			});
		} else if (existingUser.role === "APPROVER" && approverData) {
			await prisma.approver.update({
				where: {
					userId: id,
				},
				data: {
					officeId: approverData.officeId,
					departmentId: approverData.departmentId,
					// Removed 'position' as it does not exist in the type
				},
			});
		}

		// Get the updated user with all related data
		const updatedUser = await prisma.user.findUnique({
			where: {
				id,
			},
			include: {
				student: true,
				teacher: true,
				approver: {
					include: {
						office: true,
						department: true,
					},
				},
			},
		});

		res.status(200).json({
			status: "success",
			data: updatedUser,
			message: "User updated successfully",
		});
		return;
	} catch (error) {
		console.error("Update user error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while updating the user",
		});
		return;
	}
};

// Delete a user
export const deleteUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: {
				id,
			},
		});

		if (!existingUser) {
			res.status(404).json({
				status: "error",
				message: "User not found",
			});
		}

		// Delete the user
		await prisma.user.delete({
			where: {
				id,
			},
		});

		res.status(200).json({
			status: "success",
			message: "User deleted successfully",
		});
		return;
	} catch (error) {
		console.error("Delete user error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while deleting the user",
		});
		return;
	}
};

// Get all clearance requests
export const getAllClearanceRequests = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const clearanceRequests = await prisma.clearanceRequest.findMany({
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
			orderBy: {
				submittedAt: "desc",
			},
		});

		res.status(200).json({
			status: "success",
			data: clearanceRequests,
		});
		return;
	} catch (error) {
		console.error("Get all clearance requests error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching clearance requests",
		});
		return;
	}
};

// Get all workflow rules
export const getWorkflowRules = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const workflowRules = await prisma.workflowRule.findMany({
			include: {
				program: true,
				workflowSteps: {
					include: {
						office: true,
					},
					orderBy: {
						stepOrder: "asc",
					},
				},
			},
			orderBy: {
				formType: "asc",
			},
		});

		res.status(200).json({
			status: "success",
			data: workflowRules,
		});
		return;
	} catch (error) {
		console.error("Get workflow rules error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching workflow rules",
		});
		return;
	}
};

// Create a workflow rule
export const createWorkflowRule = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { formType, programId, steps } = req.body; // Removed 'description' as it is not used

		// Check if a workflow rule already exists for this form type and program
		const existingRule = await prisma.workflowRule.findFirst({
			where: {
				formType,
				programId: programId || undefined,
			},
		});

		if (existingRule) {
			res.status(400).json({
				status: "error",
				message:
					"A workflow rule already exists for this form type and program",
			});
			return;
		}

		// Create the workflow rule with steps
		const workflowRule = await prisma.workflowRule.create({
			data: {
				formType,
				programId,
				// Removed 'description' as it does not exist in the type
				workflowSteps: {
					create: steps.map((step: any, index: number) => ({
						stepOrder: index + 1,
						officeId: step.officeId,
						description: step.description,
					})),
				},
			},
			include: {
				program: true,
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

		res.status(201).json({
			status: "success",
			data: workflowRule,
			message: "Workflow rule created successfully",
		});
		return;
	} catch (error) {
		console.error("Create workflow rule error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while creating the workflow rule",
		});
		return;
	}
};

// Update a workflow rule
export const updateWorkflowRule = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const { steps } = req.body;

		// Check if workflow rule exists
		const existingRule = await prisma.workflowRule.findUnique({
			where: {
				id,
			},
		});

		if (!existingRule) {
			res.status(404).json({
				status: "error",
				message: "Workflow rule not found",
			});
			return;
		}

		// Update the workflow rule
		await prisma.workflowRule.update({
			where: {
				id,
			},
			data: {
				// Removed 'description' as it does not exist in the type
			},
		});

		// Delete existing steps
		await prisma.workflowStep.deleteMany({
			where: {
				// Removed 'connect' as it does not exist in the type
			},
		});

		// Create new steps
		await prisma.workflowStep.createMany({
			data: steps.map(
				(step: { officeId: string; description: string }, index: number) => ({
					workflowRuleId: id,
					stepOrder: index + 1,
					officeId: step.officeId,
					description: step.description,
				})
			),
		});

		// Get the updated workflow rule
		const updatedRule = await prisma.workflowRule.findUnique({
			where: {
				id,
			},
			include: {
				program: true,
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

		res.status(200).json({
			status: "success",
			data: updatedRule,
			message: "Workflow rule updated successfully",
		});
		return;
	} catch (error) {
		console.error("Update workflow rule error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while updating the workflow rule",
		});
		return;
	}
};

// Delete a workflow rule
export const deleteWorkflowRule = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		// Check if workflow rule exists
		const existingRule = await prisma.workflowRule.findUnique({
			where: {
				id,
			},
		});

		if (!existingRule) {
			res.status(404).json({
				status: "error",
				message: "Workflow rule not found",
			});
			return;
		}

		// Delete the workflow rule (steps will be deleted by cascade)
		await prisma.workflowRule.delete({
			where: {
				id,
			},
		});

		res.status(200).json({
			status: "success",
			message: "Workflow rule deleted successfully",
		});
		return;
	} catch (error) {
		console.error("Delete workflow rule error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while deleting the workflow rule",
		});
		return;
	}
};
