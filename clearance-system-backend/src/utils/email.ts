import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

// Verify the connection configuration
transporter.verify((error) => {
	if (error) {
		console.error("Email service error:", error);
	} else {
		console.log("Email service is ready to send messages");
	}
});

// Generic email sending function
export const sendEmail = async (
	to: string,
	subject: string,
	html: string
): Promise<boolean> => {
	try {
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

// Send verification email

export const sendVerificationEmail = async (
	email: string,
	token: string,
	firstName: string
): Promise<boolean> => {
	console.log("Sending verification email with token:", token);

	// The token now contains both email token and browser token
	const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

	console.log("Verification URL:", verificationUrl);

	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #3b82f6; margin-bottom: 10px;">Email Verification</h1>
        <p style="color: #4b5563; font-size: 16px;">Hello ${firstName},</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
          Thank you for registering with the Digital Clearance System. Please verify your email address by clicking the button below:
        </p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" style="display: inline-block; background-color: #3b82f6; color: white; font-weight: bold; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">Verify Email Address</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          This link will expire in 24 hours. If you did not request this verification, please ignore this email.
        </p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          <strong>Important:</strong> Please open this link in the same browser where you requested the verification.
        </p>
      </div>
      
      <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px;">
          If the button doesn't work, copy and paste this URL into your browser:
        </p>
        <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
          ${verificationUrl}
        </p>
      </div>
      
      <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Digital Clearance System. All rights reserved.</p>
      </div>
    </div>
  `;

	return sendEmail(email, "Verify Your Email - Digital Clearance System", html);
};

// Send password reset email
export const sendPasswordResetEmail = async (
	email: string,
	token: string,
	firstName: string
): Promise<boolean> => {
	const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #3b82f6; margin-bottom: 10px;">Password Reset</h1>
        <p style="color: #4b5563; font-size: 16px;">Hello ${firstName},</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; font-weight: bold; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">Reset Password</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
        </p>
      </div>
      
      <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px;">
          If the button doesn't work, copy and paste this URL into your browser:
        </p>
        <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
          ${resetUrl}
        </p>
      </div>
      
      <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Digital Clearance System. All rights reserved.</p>
      </div>
    </div>
  `;

	return sendEmail(
		email,
		"Reset Your Password - Digital Clearance System",
		html
	);
};

// Send notification email
export const sendNotificationEmail = async (
	email: string,
	subject: string,
	message: string,
	firstName: string
): Promise<boolean> => {
	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #3b82f6; margin-bottom: 10px;">Notification</h1>
        <p style="color: #4b5563; font-size: 16px;">Hello ${firstName},</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
          ${message}
        </p>
      </div>
      
      <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Digital Clearance System. All rights reserved.</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;

	return sendEmail(email, subject, html);
};
