import { Router } from "express";
import {
	getAllUsers,
	createUser,
	updateUser,
	deleteUser,
	getAllClearanceRequests,
	getWorkflowRules,
	createWorkflowRule,
	updateWorkflowRule,
	deleteWorkflowRule,
} from "../controllers/admin.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// User management
router.get("/users", authenticate, authorize(["ADMIN"]), getAllUsers);
router.post("/users", authenticate, authorize(["ADMIN"]), createUser);
router.put("/users/:id", authenticate, authorize(["ADMIN"]), updateUser);
router.delete("/users/:id", authenticate, authorize(["ADMIN"]), deleteUser);

// Clearance request management
router.get(
	"/clearance-requests",
	authenticate,
	authorize(["ADMIN"]),
	getAllClearanceRequests
);

// Workflow management
router.get(
	"/workflow-rules",
	authenticate,
	authorize(["ADMIN"]),
	getWorkflowRules
);
router.post(
	"/workflow-rules",
	authenticate,
	authorize(["ADMIN"]),
	createWorkflowRule
);
router.put(
	"/workflow-rules/:id",
	authenticate,
	authorize(["ADMIN"]),
	updateWorkflowRule
);
router.delete(
	"/workflow-rules/:id",
	authenticate,
	authorize(["ADMIN"]),
	deleteWorkflowRule
);

export default router;
