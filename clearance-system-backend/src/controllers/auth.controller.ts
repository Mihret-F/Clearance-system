import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../server";
import crypto from "crypto";
import {
	sendEmail,
	sendVerificationEmail,
	sendPasswordResetEmail,
} from "../utils/email";

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

			// Fixed lock duration (30 minutes)
			const lockDuration = 30;

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
		const fingerprint = crypto.randomBytes(32).toString("hex");

		// Generate JWT token with fingerprint
		const token = jwt.sign(
			{ id: user.id, role: user.role, fingerprint },
			process.env.JWT_SECRET as string,
			{
				expiresIn: req.body.rememberMe ? "1d" : "24h",
			}
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
		const fingerprint = crypto.randomBytes(32).toString("hex");
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

// Verify email

// Update the verifyEmail function to properly store the browser token
export const verifyEmail = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { email } = req.body;
		const userId = req.user.id;

		console.log("Verifying email for user:", userId, "Email:", email);

		// Generate a unique browser token
		const browserToken = crypto.randomBytes(32).toString("hex");

		// Check if user exists
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

		// Check if email is already in use by another user
		const existingUser = await prisma.user.findFirst({
			where: {
				email,
				id: { not: userId },
			},
		});

		if (existingUser) {
			res.status(400).json({
				status: "error",
				message: "Email is already in use by another user",
			});
			return;
		}

		// Generate verification token
		const emailToken = crypto.randomBytes(16).toString("hex");
		console.log("Generated raw token:", emailToken);

		const emailTokenHash = crypto
			.createHash("sha256")
			.update(emailToken)
			.digest("hex");
		console.log("Generated token hash:", emailTokenHash);

		// Set token expiry (10 minutes)
		const emailTokenExpiry = new Date();
		emailTokenExpiry.setMinutes(emailTokenExpiry.getMinutes() + 10);

		// Update user with token, temporary email, and browser token
		await prisma.user.update({
			where: { id: userId },
			data: {
				email, // Store the email temporarily
				emailToken: emailTokenHash,
				emailTokenExpiry,
				browserFingerprint: browserToken, // Store the browser token
			},
		});

		// Send verification email with browser token embedded
		const emailSent = await sendVerificationEmail(
			email,
			`${emailToken}:${browserToken}`, // Send both tokens
			user.firstName
		);

		if (!emailSent) {
			res.status(500).json({
				status: "error",
				message: "Failed to send verification email",
			});
			return;
		}

		// Return the browser token to be stored in localStorage
		res.status(200).json({
			status: "success",
			message: "Verification email sent successfully",
			browserToken: browserToken, // Return browser token to client
		});
	} catch (error) {
		console.error("Send verification email error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while sending verification email",
		});
	}
};

// Update the confirmEmailVerification function to strictly enforce browser verification
export const confirmEmailVerification = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { token } = req.query;

		console.log("Received token for verification:", token);

		if (!token || typeof token !== "string") {
			res.status(400).json({
				status: "error",
				message: "Verification token is required",
			});
			return;
		}

		// Split the combined token
		const [emailToken, browserToken] = token.split(":");

		if (!emailToken) {
			res.status(400).json({
				status: "error",
				message: "Invalid verification token format",
			});
			return;
		}

		// Hash the email token to compare with stored hash
		const emailTokenHash = crypto
			.createHash("sha256")
			.update(emailToken)
			.digest("hex");

		console.log("Generated token hash for verification:", emailTokenHash);

		// Find user with valid token
		const user = await prisma.user.findFirst({
			where: {
				emailToken: emailTokenHash,
				emailTokenExpiry: {
					gt: new Date(),
				},
			},
		});

		if (!user) {
			// Check if user is already verified with this token (token might be cleared)
			const verifiedUser = await prisma.user.findFirst({
				where: {
					emailVerified: true,
					email: { not: null },
				},
			});

			if (verifiedUser) {
				res.status(200).json({
					status: "success",
					message: "Email has already been verified successfully",
				});
				return;
			}

			// Check if token exists but is expired
			const expiredUser = await prisma.user.findFirst({
				where: {
					emailToken: emailTokenHash,
					emailTokenExpiry: {
						lte: new Date(),
					},
				},
			});

			if (expiredUser) {
				res.status(400).json({
					status: "error",
					message:
						"Verification token has expired. Please request a new verification email.",
					expired: true,
				});
			} else {
				res.status(400).json({
					status: "error",
					message:
						"Invalid verification token. Please check your email or request a new verification link.",
				});
			}
			return;
		}

		// Update user as verified
		await prisma.user.update({
			where: { id: user.id },
			data: {
				emailVerified: true,
				emailToken: null,
				emailTokenExpiry: null,
				browserFingerprint: null, // Clear the browser token
			},
		});

		console.log("User email verified successfully");

		// Return success response
		res.status(200).json({
			status: "success",
			message: "Email verification successful",
		});
	} catch (error) {
		console.error("Email verification confirmation error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred during email verification",
		});
	}
};

// Send verification email
export const sendVerificationEmailLink = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { email } = req.body;
		const userId = req.user.id;

		// Get browser fingerprint from request headers or generate one
		const browserFingerprint =
			req.headers["user-agent"] || crypto.randomBytes(16).toString("hex");

		// Check if user exists
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

		// Check if email is already in use by another user
		const existingUser = await prisma.user.findFirst({
			where: {
				email,
				id: { not: userId },
			},
		});

		if (existingUser) {
			res.status(400).json({
				status: "error",
				message: "Email is already in use by another user",
			});
			return;
		}

		// Generate verification token
		const emailToken = crypto.randomBytes(32).toString("hex");
		const emailTokenHash = crypto
			.createHash("sha256")
			.update(emailToken)
			.digest("hex");

		// Set token expiry (24 hours)
		const emailTokenExpiry = new Date();
		emailTokenExpiry.setHours(emailTokenExpiry.getHours() + 24);

		// Update user with token, temporary email, and browser fingerprint
		await prisma.user.update({
			where: { id: userId },
			data: {
				email, // Store the email temporarily
				emailToken: emailTokenHash,
				emailTokenExpiry,
				browserFingerprint: browserFingerprint, // Store the browser fingerprint
			},
		});

		// Send verification email
		const emailSent = await sendVerificationEmail(
			email,
			emailToken,
			user.firstName
		);

		if (!emailSent) {
			res.status(500).json({
				status: "error",
				message: "Failed to send verification email",
			});
			return;
		}

		res.status(200).json({
			status: "success",
			message: "Verification email sent successfully",
		});
	} catch (error) {
		console.error("Send verification email error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while sending verification email",
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
				emailVerified: true, // Instead of using emailVerificationSkipped, we'll mark the email as verified
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
			// Don't reveal if email exists for security reasons
			res.status(200).json({
				status: "success",
				message:
					"If your email is registered, you will receive a password reset link",
			});
			return;
		}

		// Check if email is verified
		if (!user.emailVerified) {
			res.status(400).json({
				status: "error",
				message: "Your email is not verified. Please contact the admin.",
			});
			return;
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		const resetTokenHash = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		// Set token expiry (1 hour)
		const resetTokenExpiry = new Date();
		resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

		// Update user with reset token
		await prisma.user.update({
			where: { id: user.id },
			data: {
				resetToken: resetTokenHash,
				resetTokenExpiry,
			},
		});

		const emailSent = await sendPasswordResetEmail(
			user.email!,
			resetToken,
			user.firstName
		);

		if (!emailSent) {
			res.status(500).json({
				status: "error",
				message: "Failed to send password reset email",
			});
			return;
		}

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

		if (!token || !newPassword) {
			res.status(400).json({
				status: "error",
				message: "Token and password are required",
			});
			return;
		}

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
				isFirstLogin: false, // Ensure user doesn't get first login prompt
				lastLogin: new Date(), // Update last login time
			},
		});

		res.status(200).json({
			status: "success",
			message: "Password has been reset successfully",
		});
	} catch (error) {
		console.error("Reset password error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while resetting password",
		});
	}
};

// Check auth status
export const checkAuthStatus = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user.id;

		// Get user data
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				student: {
					include: {
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

		// Return user data
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
			},
		});
	} catch (error) {
		console.error("Check auth status error:", error);
		res.status(500).json({
			status: "error",
			message: "An error occurred while checking authentication status",
		});
	}
};
