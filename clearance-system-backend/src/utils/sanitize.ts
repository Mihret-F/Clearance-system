import { Request, Response, NextFunction } from "express";
import xss from "xss";

/**
 * Sanitizes a string to prevent XSS attacks
 * @param input String to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (input: string): string => {
	if (typeof input !== "string") return input;
	return xss(input);
};

/**
 * Recursively sanitizes an object's string properties
 * @param obj Object to sanitize
 * @returns Sanitized object
 */
export const sanitizeObject = <T>(obj: T): T => {
	if (!obj || typeof obj !== "object") return obj;

	const result = { ...obj };

	for (const key in result) {
		if (typeof result[key] === "string") {
			result[key] = sanitizeString(result[key]) as any;
		} else if (typeof result[key] === "object" && result[key] !== null) {
			result[key] = sanitizeObject(result[key]) as any;
		}
	}

	return result;
};

/**
 * Middleware to sanitize request body, query and params
 */
export const sanitizeMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	if (req.body) {
		Object.keys(req.body).forEach((key) => {
			req.body[key] = sanitizeObject(req.body[key]);
		});
	}

	if (req.query) {
		Object.keys(req.query).forEach((key) => {
			req.query[key] = sanitizeObject(req.query[key]);
		});
	}

	if (req.params) {
		Object.keys(req.params).forEach((key) => {
			req.params[key] = sanitizeObject(req.params[key]);
		});
	}

	next();
};
