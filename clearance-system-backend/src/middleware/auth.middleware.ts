import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../server";

interface JwtPayload {
	id: string;
	role: string;
	fingerprint: string;
}

// Extend the Express Request interface to include user
declare global {
	namespace Express {
		interface Request {
			user: JwtPayload;
		}
	}
}

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Get token from header
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({
				status: "error",
				message: "Authentication required. Please log in.",
			});
			return;
		}

		const token = authHeader.split(" ")[1];

		// Verify token
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET as string
		) as JwtPayload;

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { id: decoded.id },
		});

		if (!user) {
			res.status(401).json({
				status: "error",
				message: "Invalid authentication token",
			});
			return;
		}

		// Check if user is active
		if (user.status === "INACTIVE") {
			res.status(403).json({
				status: "error",
				message: "Your account is inactive. Please contact an administrator.",
			});
			return;
		}

		// Set user in request object
		req.user = decoded;
		next();
	} catch (error) {
		console.error("Authentication error:", error);
		res.status(401).json({
			status: "error",
			message: "Invalid or expired authentication token",
		});
	}
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({
				status: "error",
				message: "Authentication required",
			});
			return;
		}

		if (!roles.includes(req.user.role)) {
			res.status(403).json({
				status: "error",
				message: "You don't have permission to access this resource",
			});
			return;
		}

		next();
	};
};
