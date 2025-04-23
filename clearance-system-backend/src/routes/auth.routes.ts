import { Router } from "express";
import {
	login,
	changePassword,
	forgotPassword,
	resetPassword,
	verifyEmail,
	sendVerificationEmailLink,
	confirmEmailVerification,
	skipEmailVerification,
	checkAuthStatus,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import {
	validateLogin,
	validatePasswordChange,
	validateEmailVerification,
	validateForgotPassword,
	validateResetPassword,
} from "../middleware/validation.middleware";
import { runValidation } from "../utils/runValidation";

const router = Router();

// Helper to wrap validation chains
const wrapValidation = (validations: any[]) => [...validations, runValidation];

router.post("/login", wrapValidation(validateLogin), login);
router.post(
	"/forgot-password",
	wrapValidation(validateForgotPassword),
	forgotPassword
);
router.post(
	"/reset-password",
	wrapValidation(validateResetPassword),
	resetPassword
);

router.get("/verify-email", confirmEmailVerification); // Public route to confirm email via token

// Protected routes (require authentication)
router.post(
	"/change-password",
	authenticate,
	wrapValidation(validatePasswordChange),
	changePassword
);
router.post(
	"/send-verification-email",
	authenticate,
	sendVerificationEmailLink
);
router.get("/status", authenticate, checkAuthStatus); // Check if user is logged in and email is verified
router.post(
	"/verify-email",
	authenticate,
	wrapValidation(validateEmailVerification),
	verifyEmail
);
router.post("/skip-email-verification", authenticate, skipEmailVerification);

export default router;
