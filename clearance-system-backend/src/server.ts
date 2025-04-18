import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import clearanceRoutes from "./routes/clearance.routes";
import approverRoutes from "./routes/approver.routes";
import adminRoutes from "./routes/admin.routes";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { sanitizeMiddleware } from "./utils/sanitize";

// Load environment variables
dotenv.config();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Parsing middleware (must come before sanitization)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// XSS protection middleware
app.use(sanitizeMiddleware);

app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
		credentials: true,
	})
);

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
	message: "Too many requests from this IP, please try again after 15 minutes",
});

// Apply rate limiting to all requests
app.use(limiter);

// Apply stricter rate limits to authentication endpoints
const authLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10, // limit each IP to 10 login attempts per hour
	standardHeaders: true,
	legacyHeaders: false,
	message:
		"Too many login attempts from this IP, please try again after an hour",
});

// Routes
app.use("/api/auth/login", authLimiter); // Apply stricter rate limit to login
app.use("/api/auth/forgot-password", authLimiter); // Apply stricter rate limit to password reset
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clearance", clearanceRoutes);
app.use("/api/approver", approverRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		console.error(err.stack);
		res.status(500).json({
			status: "error",
			message: err.message || "Something went wrong on the server",
		});
	}
);

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
	await prisma.$disconnect();
	console.log("Disconnected from database");
	process.exit(0);
});
