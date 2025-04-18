import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

// Helper function to handle validation errors
const handleValidationErrors = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			status: "error",
			errors: errors.array(),
		});
	}
	next();
};

// Login validation

export const validateLogin = [
	body("username")
		.trim()
		.notEmpty()
		.withMessage("Username is required")
		.isLength({ min: 3, max: 50 })
		.withMessage("Username must be between 3 and 50 characters")
		.escape(),
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isString()
		.withMessage("Password must be a string")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters"),
];

// Password change validation
export const validatePasswordChange = [
	body("currentPassword")
		.optional() // Optional for first login
		.notEmpty()
		.withMessage("Current password is required"),
	body("newPassword")
		.notEmpty()
		.withMessage("New password is required")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
		.withMessage(
			"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
		),
	body("confirmPassword")
		.notEmpty()
		.withMessage("Confirm password is required")
		.custom((value, { req }) => {
			if (value !== req.body.newPassword) {
				throw new Error("Passwords do not match");
			}
			return true;
		}),
	handleValidationErrors,
];
// Email verification validation
export const validateEmailVerification = [
	body("email")
		.trim()
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Invalid email format")
		.matches(
			/^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|yahoo\.com|hotmail\.com|university\.edu)$/i
		)
		.withMessage(
			"Please use a valid email from a known provider (Gmail, Outlook, Yahoo, Hotmail, or university.edu)"
		)
		.normalizeEmail(),
	handleValidationErrors,
];

// Email confirmation validation
export const validateEmailConfirmation = [
	body("token").notEmpty().withMessage("Verification token is required"),
	handleValidationErrors,
];

// Forgot password validation
export const validateForgotPassword = [
	body("email")
		.trim()
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Invalid email format")
		.normalizeEmail(),
	handleValidationErrors,
];

// Reset password validation
export const validateResetPassword = [
	body("token").notEmpty().withMessage("Reset token is required"),
	body("newPassword")
		.notEmpty()
		.withMessage("New password is required")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
		.withMessage(
			"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
		),
	body("confirmPassword")
		.notEmpty()
		.withMessage("Confirm password is required")
		.custom((value, { req }) => {
			if (value !== req.body.newPassword) {
				throw new Error("Passwords do not match");
			}
			return true;
		}),
	handleValidationErrors,
];
