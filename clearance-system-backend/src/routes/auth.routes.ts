import { Router } from "express";
import {
	login,
	changePassword,
	verifyEmail,
	skipEmailVerification,
	forgotPassword,
	resetPassword,
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
router.post(
	"/change-password",
	authenticate,
	wrapValidation(validatePasswordChange),
	changePassword
);
router.post(
	"/verify-email",
	authenticate,
	wrapValidation(validateEmailVerification),
	verifyEmail
);
router.post("/skip-email-verification", authenticate, skipEmailVerification);

export default router;
