import { Router } from "express";
import {
	approveRequest,
	rejectRequest,
	getPendingRequests,
} from "../controllers/approver.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get(
	"/pending",
	authenticate,
	authorize(["APPROVER"]),
	getPendingRequests
);
router.post(
	"/request/:id/approve",
	authenticate,
	authorize(["APPROVER"]),
	approveRequest
);
router.post(
	"/request/:id/reject",
	authenticate,
	authorize(["APPROVER"]),
	rejectRequest
);

export default router;
