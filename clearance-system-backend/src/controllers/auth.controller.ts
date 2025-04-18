import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { sendEmail } from "../utils/email";

// // Configure email transporter
// const transporter = nodemailer.createTransport({
// 	host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
// 	port: parseInt(process.env.EMAIL_PORT || "2525"),
// 	auth: {
// 		user: process.env.EMAIL_USER || "",
// 		pass: process.env.EMAIL_PASS || "",
// 	},
// });

// // Helper function to send email
// const sendEmail = async (to: string, subject: string, html: string) => {
// 	try {
// 		await transporter.sendMail({
// 			from: process.env.EMAIL_FROM || "noreply@university.edu",
// 			to,
// 			subject,
// 			html,
// 		});
// 		return true;
// 	} catch (error) {
// 		console.error("Email sending error:", error);
// 		return false;
// 	}
// };

// Login controller
export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { username, password } = req.body;

		// Find user by username
		const user = await prisma.user.findUnique({
			where: { username },
			include: {
				student: true,
				teacher: true,
				approver: true,
			},
		});

		if (!username || !password) {
			res.status(400).json({
				status: "error",
				errors: [
					{
						type: "field",
						msg: "Username and password are required",
						path: !username ? "username" : "password",
						location: "body",
					},
				],
			});
			return;
		}

		if (!user) {
			res.status(401).json({
				status: "error",
				errors: [
					{
						type: "field",
						msg: "Invalid username or password",
						path: "username",
						location: "body",
					},
				],
			});
			return;
		}

		// Check if user is active
		if (user.status === "INACTIVE") {
			res.status(403).json({
				status: "error",
				message: "Your account is inactive. Please contact an administrator.",
			});
			return;
		}

		// Check if account is locked
		if (user.isLocked && user.lockedAt) {
			// Ensure lockedAt is not null
			const lockTime = new Date(user.lockedAt);
			const now = new Date();
			const diffInMinutes = Math.floor(
				(now.getTime() - lockTime.getTime()) / (1000 * 60)
			);

			// Lock duration increases with each cycle (30 min, 1 hour, 2 hours, etc.)
			const lockDuration = 30 * Math.pow(2, user.lockCycles - 1);

			if (diffInMinutes < lockDuration) {
				const remainingMinutes = lockDuration - diffInMinutes;
				res.status(403).json({
					status: "error",
					message: `Your account is temporarily locked. Please try again in ${remainingMinutes} minutes.`,
				});
				return;
			} else {
				// Unlock account if lock duration has passed
				await prisma.user.update({
					where: { id: user.id },
					data: {
						isLocked: false,
						loginAttempts: 0,
					},
				});
			}
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

		if (!isPasswordValid) {
			// Increment login attempts
			const loginAttempts = user.loginAttempts + 1;

			// Lock account after 5 failed attempts
			if (loginAttempts >= 5) {
				await prisma.user.update({
					where: { id: user.id },
					data: {
						loginAttempts: 0,
						isLocked: true,
						lockedAt: new Date(), // Ensure lockedAt is updated
						lockCycles: user.lockCycles + 1,
					},
				});

				res.status(401).json({
					status: "error",
					message:
						"Your account has been temporarily locked due to multiple failed login attempts.",
				});
				return;
			}

			await prisma.user.update({
				where: { id: user.id },
				data: { loginAttempts: loginAttempts },
			});

			res.status(401).json({
				status: "error",
				message: "Invalid username or password",
				attemptsLeft: 5 - loginAttempts,
			});
			return;
		}

		// Reset login attempts on successful login
		await prisma.user.update({
			where: { id: user.id },
			data: { loginAttempts: 0 },
		});

		// Check if it's the first login
		if (user.isFirstLogin) {
			// Generate a temporary token for first login
			const tempToken = jwt.sign(
				{ id: user.id, role: user.role, temp: true },
				process.env.JWT_SECRET as string,
				{ expiresIn: "1h" }
			);

			res.status(200).json({
				status: "success",
				isFirstLogin: true,
				token: tempToken,
			});
			return;
		}

		// Generate fingerprint for the session
		const fingerprint = crypto.randomBytes(16).toString("hex");

		// Generate JWT token with fingerprint
		const token = jwt.sign(
			{ id: user.id, role: user.role, fingerprint },
			process.env.JWT_SECRET as string,
			{ expiresIn: "24h" }
		);

		// Update last login time
		await prisma.user.update({
			where: { id: user.id },
			data: { lastLogin: new Date() },
		});

		// Return user info and token
		res.status(200).json({
			status: "success",
			data: {
				user: {
					id: user.id,
					username: user.username,
					firstName: user.firstName,
					fatherName: user.fatherName,
					grandfatherName: user.grandfatherName,
					email: user.email,
					role: user.role,
					isFirstLogin: user.isFirstLogin,
					emailVerified: user.emailVerified,
					student: user.student,
					teacher: user.teacher,
					approver: user.approver,
				},
				token,
				isFirstLogin: user.isFirstLogin,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred during login",
		});
	}
};

// Change password controller
export const changePassword = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user.id;

		// Get user with password
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			res.status(404).json({
				status: "error",
				message: "User not found",
			});
			return;
		}

		// For first login, currentPassword might be the temporary one
		if (!user.isFirstLogin) {
			// Verify current password
			const isPasswordValid = await bcrypt.compare(
				currentPassword,
				user.passwordHash
			);

			if (!isPasswordValid) {
				res.status(401).json({
					status: "error",
					message: "Current password is incorrect",
				});
				return;
			}
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update user password and first login status
		await prisma.user.update({
			where: { id: userId },
			data: {
				passwordHash: hashedPassword,
				isFirstLogin: false,
			},
		});

		// Generate new token
		const fingerprint = crypto.randomBytes(16).toString("hex");
		const token = jwt.sign(
			{ id: user.id, role: user.role, fingerprint },
			process.env.JWT_SECRET as string,
			{ expiresIn: "24h" }
		);

		res.status(200).json({
			status: "success",
			message: "Password changed successfully",
			token,
		});
	} catch (error) {
		console.error("Change password error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while changing password",
		});
	}
};

// Verify email controller
export const verifyEmail = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { email } = req.body;
		const userId = req.user.id;

		// Check if email is already in use
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

		// Update user email
		await prisma.user.update({
			where: { id: userId },
			data: {
				email,
				emailVerified: true,
			},
		});

		// Send verification email
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (user) {
			const emailSent = await sendEmail(
				email,
				"Email Verification - Digital Clearance System",
				`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3b82f6;">Email Verification Successful</h2>
          <p>Hello ${user.firstName} ${user.fatherName},</p>
          <p>Your email has been successfully verified and linked to your account in the Digital Clearance System.</p>
          <p>You will now receive notifications about your clearance requests and updates at this email address.</p>
          <p>If you did not request this change, please contact the system administrator immediately.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #666;">This is an automated message from the Digital Clearance System. Please do not reply to this email.</p>
          </div>
        </div>
        `
			);
		}

		res.status(200).json({
			status: "success",
			message: "Email verified successfully",
		});
	} catch (error) {
		console.error("Email verification error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred during email verification",
		});
	}
};

// Skip email verification
export const skipEmailVerification = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user.id;

		// Update user to mark email verification as skipped
		await prisma.user.update({
			where: { id: userId },
			data: {
				emailVerificationSkipped: true,
			},
		});

		res.status(200).json({
			status: "success",
			message: "Email verification skipped",
		});
	} catch (error) {
		console.error("Skip email verification error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while skipping email verification",
		});
	}
};

// Forgot password controller
export const forgotPassword = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { email } = req.body;

		// Find user by email
		const user = await prisma.user.findFirst({
			where: { email },
		});

		if (!user) {
			// Don't reveal that the user doesn't exist
			res.status(200).json({
				status: "success",
				message:
					"If your email is registered, you will receive a password reset link",
			});
			return;
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		const resetTokenHash = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		// Store token in database with expiration (1 hour)
		const resetTokenExpiry = new Date();
		resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

		await prisma.user.update({
			where: { id: user.id },
			data: {
				resetToken: resetTokenHash,
				resetTokenExpiry,
			},
		});

		// Send email with reset link
		const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

		const emailSent = await sendEmail(
			email,
			"Password Reset - Digital Clearance System",
			`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #3b82f6;">Password Reset Request</h2>
        <p>Hello ${user.firstName} ${user.fatherName},</p>
        <p>You requested a password reset for your Digital Clearance System account.</p>
        <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you did not request this password reset, please ignore this email or contact the system administrator.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 12px; color: #666;">This is an automated message from the Digital Clearance System. Please do not reply to this email.</p>
        </div>
      </div>
      `
		);

		res.status(200).json({
			status: "success",
			message:
				"If your email is registered, you will receive a password reset link",
		});
	} catch (error) {
		console.error("Forgot password error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while processing your request",
		});
	}
};

// Reset password controller
export const resetPassword = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { token, newPassword } = req.body;

		// Hash the token to compare with stored hash
		const resetTokenHash = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		// Find user with valid token
		const user = await prisma.user.findFirst({
			where: {
				resetToken: resetTokenHash,
				resetTokenExpiry: {
					gt: new Date(),
				},
			},
		});

		if (!user) {
			res.status(400).json({
				status: "error",
				message: "Invalid or expired reset token",
			});
			return;
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update user password and clear reset token
		await prisma.user.update({
			where: { id: user.id },
			data: {
				passwordHash: hashedPassword,
				resetToken: null,
				resetTokenExpiry: null,
				isFirstLogin: false,
			},
		});

		// Send confirmation email
		if (user.email) {
			// Ensure email is not null
			await sendEmail(
				user.email,
				"Password Reset Successful - Digital Clearance System",
				`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #3b82f6;">Password Reset Successful</h2>
            <p>Hello ${user.firstName} ${user.fatherName},</p>
            <p>Your password has been successfully reset.</p>
            <p>You can now log in to the Digital Clearance System with your new password.</p>
            <p>If you did not request this change, please contact the system administrator immediately.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 12px; color: #666;">This is an automated message from the Digital Clearance System. Please do not reply to this email.</p>
            </div>
        </div>
        `
			);
		}

		res.status(200).json({
			status: "success",
			message: "Password has been reset successfully",
		});
	} catch (error) {
		console.error("Reset password error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while resetting your password",
		});
	}
};
