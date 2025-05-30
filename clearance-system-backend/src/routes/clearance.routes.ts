import { Router } from "express";
import {
	getWorkflow,
	getReasons,
	submitClearanceRequest,
	getFormTypes,
	getDocumentTypes,
	getUserClearanceRequests,
	getPendingDocuments,
	uploadDocument,
	handleApprovalAction,
	getRequestWorkflow,
	getDeadlines,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	sendSystemMaintenanceNotification,
	getNotifications,
} from "../controllers/clearance.controller";
import { authenticate } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import multer from "multer";

const router = Router();
// const upload = multer({ dest: "uploads/" });

router.get("/form-types", authenticate, getFormTypes);

router.get("/document-types", authenticate, getDocumentTypes);
router.get("/reasons/:formType", authenticate, getReasons);
router.post("/workflow", authenticate, getWorkflow);
router.get("/workflow/:requestId", authenticate, getRequestWorkflow);
router.get("/requests", authenticate, getUserClearanceRequests);
router.get("/documents/:requestId", authenticate, getPendingDocuments);
router.post(
	"/submit-request",
	authenticate,
	upload.array("documents"),
	submitClearanceRequest
);
router.post(
	"/upload-document",
	authenticate,
	upload.single("file"),
	uploadDocument
);
router.post("/approve-reject", authenticate, handleApprovalAction);
router.get("/deadlines", authenticate, getDeadlines);
router.post("/notifications/read", authenticate, markNotificationAsRead);
router.post(
	"/notifications/read-all",
	authenticate,
	markAllNotificationsAsRead
);
router.post(
	"/system-maintenance",
	authenticate,
	sendSystemMaintenanceNotification
);
router.get("/notifications", authenticate, getNotifications);

export default router;
