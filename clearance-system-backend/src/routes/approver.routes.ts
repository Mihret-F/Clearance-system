import { Router } from "express";
import {
	approveRequest,
	rejectRequest,
	getPendingRequests,
	getAnalytics,
	getApprovedRequests,
	getRejectedRequests,
} from "../controllers/approver.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get(
	"/pending",
	authenticate,
	authorize(["APPROVER"]),
	getPendingRequests
);
router.get(
	"/approved",
	authenticate,
	authorize(["APPROVER"]),
	getApprovedRequests
);
router.get(
	"/rejected",
	authenticate,
	authorize(["APPROVER"]),
	getRejectedRequests
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
router.get("/analytics", authenticate, authorize(["APPROVER"]), getAnalytics);

export default router;
