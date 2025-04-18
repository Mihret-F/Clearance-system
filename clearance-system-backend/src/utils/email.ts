import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST || "smtp.gmail.com",
	port: parseInt(process.env.EMAIL_PORT || "587"),
	secure: process.env.EMAIL_SECURE === "true",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

/**
 * Send an email
 * @param to Recipient email address
 * @param subject Email subject
 * @param html HTML content of the email
 * @returns Promise that resolves to true if email was sent successfully
 */
export const sendEmail = async (
	to: string,
	subject: string,
	html: string
): Promise<boolean> => {
	try {
		if (!to) {
			console.error("No recipient email provided");
			return false;
		}

		const mailOptions = {
			from: `"Digital Clearance System" <${process.env.EMAIL_USER}>`,
			to,
			subject,
			html,
		};

		await transporter.sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error("Error sending email:", error);
		return false;
	}
};
