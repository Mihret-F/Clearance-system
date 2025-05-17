import { Request, Response } from "express";
import { prisma } from "../server";

// Get user profile
export const getUserProfile = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user.id;

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				username: true,
				firstName: true,
				fatherName: true,
				grandfatherName: true,
				email: true,
				role: true,
				lastLogin: true,
				student: {
					include: {
						department: true,
						program: true,
					},
				},
				teacher: {
					include: {
						department: true,
					},
				},
				approver: {
					include: {
						office: true,
						department: true,
					},
				},
			},
		});

		if (!user) {
			res.status(404).json({
				status: "error",
				message: "User not found",
			});
			return;
		}

		res.status(200).json({
			status: "success",
			data: user,
		});
		return;
	} catch (error) {
		console.error("Get profile error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching user profile",
		});
		return;
	}
};

// Update user profile
export const updateUserProfile = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user.id;
		const { firstName, fatherName, grandfatherName, email } = req.body;

		// Check if email is already in use
		if (email) {
			const existingUser = await prisma.user.findFirst({
				where: {
					email,
					id: { not: userId },
				},
			});

			if (existingUser) {
				res.status(400).json({
					status: "error",
					message: "Email is already in use",
				});
				return;
			}
		}

		// Update user profile
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				firstName,
				fatherName,
				grandfatherName,
				email,
			},
			select: {
				id: true,
				username: true,
				firstName: true,
				fatherName: true,
				grandfatherName: true,
				email: true,
				role: true,
			},
		});

		res.status(200).json({
			status: "success",
			data: updatedUser,
			message: "Profile updated successfully",
		});
		return;
	} catch (error) {
		console.error("Update profile error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while updating user profile",
		});
		return;
	}
};
