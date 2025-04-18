import { Router } from "express";
import {
	getUserProfile,
	updateUserProfile,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);

export default router;
