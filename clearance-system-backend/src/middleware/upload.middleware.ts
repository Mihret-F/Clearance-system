import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// Create user-specific directory
		const userId = req.user?.id;
		const userDir = path.join(uploadsDir, userId);

		if (!fs.existsSync(userDir)) {
			fs.mkdirSync(userDir, { recursive: true });
		}

		cb(null, userDir);
	},
	filename: (req, file, cb) => {
		// Generate unique filename
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, file.fieldname + "-" + uniqueSuffix + ext);
	},
});

// File filter
const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	// Accept only certain file types
	const allowedTypes = [
		"application/pdf",
		"image/jpeg",
		"image/png",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	];

	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				"Invalid file type. Only PDF, JPEG, PNG, and DOCX files are allowed."
			)
		);
	}
};

// Export the configured multer middleware
export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB
	},
});
