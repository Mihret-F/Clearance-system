import { Router } from "express";
import {
	createClearanceRequest,
	getClearanceRequests,
	getClearanceRequestById,
	uploadDocument,
	getRequestDocuments,
	getRequestWorkflow,
	getFormTypes,
	getTerminationReasons,
	getDocumentTypes,
	getIdReplacementReasons,
	submitClearanceRequest,
	getUserNotifications,
} from "../controllers/clearance.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

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
router.get("/workflow/:requestId", authenticate, getRequestWorkflow);
router.get("/documents/:requestId", authenticate, getRequestDocuments);
router.get("/form-types", authenticate, getFormTypes);
router.get("/termination-reasons", authenticate, getTerminationReasons);
router.get("/id-replacement-reasons", authenticate, getIdReplacementReasons);
router.get("/document-types", authenticate, getDocumentTypes);
router.post(
	"/submit-request",
	authenticate,
	upload.array("documents"),
	submitClearanceRequest
);
router.get("/notifications", authenticate, getUserNotifications);
// Add this route
router.post(
	"/upload-document",
	authenticate,
	upload.single("file"),
	uploadDocument
);

export default router;
