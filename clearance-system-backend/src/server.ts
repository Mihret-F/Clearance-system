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
import cookieParser from "cookie-parser";
import { sanitizeMiddleware } from "./utils/sanitize";
import { Server } from "socket.io";
import http from "http";

dotenv.config();
export const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
		methods: ["GET", "POST"],
		credentials: true,
	},
});

app.set("io", io); // Make io available to routes

// WebSocket connection
io.on("connection", (socket) => {
	console.log("A user connected:", socket.id);

	// Join user-specific room
	socket.on("join", (userId: string) => {
		socket.join(`user:${userId}`);
		console.log(`User ${userId} joined room`);
	});

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
	});
});

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeMiddleware);
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
		credentials: true,
	})
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clearance", clearanceRoutes);
app.use("/api/approver", approverRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok", message: "Server is running" });
});

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
	await prisma.$disconnect();
	console.log("Disconnected from database");
	process.exit(0);
});
