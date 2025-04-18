import { Router } from "express";
import {
	createClearanceRequest,
	getClearanceRequests,
	getClearanceRequestById,
	uploadDocument,
} from "../controllers/clearance.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post(
	"/request",
	authenticate,
	authorize(["STUDENT", "TEACHER"]),
	createClearanceRequest
);
router.get("/requests", authenticate, getClearanceRequests);
router.get("/request/:id", authenticate, getClearanceRequestById);
router.post("/request/:id/document", authenticate, uploadDocument);

export default router;
