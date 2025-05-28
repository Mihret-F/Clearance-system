import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter for sending emails

const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'smtp.gmail.com' with port if using host
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // <== THIS LINE IS CRITICAL
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
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #3b82f6;">Email Verification</h1>
        <p>Hello ${firstName},</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center;">
          <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Verify Email Address</a>
        </div>
        <p style="margin-top: 20px;">This link will expire in 24 hours. If you didn’t request this, ignore this email.</p>
      </div>
      <p style="font-size: 12px; color: gray;">© ${new Date().getFullYear()} Digital Clearance System</p>
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
      <h1 style="color: #3b82f6;">Password Reset</h1>
      <p>Hello ${firstName},</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour. If you didn’t request this, ignore this email.</p>
      <p style="font-size: 12px; color: gray;">© ${new Date().getFullYear()} Digital Clearance System</p>
    </div>
  `;

  return sendEmail(email, "Reset Your Password - Digital Clearance System", html);
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
      <h1 style="color: #3b82f6;">Notification</h1>
      <p>Hello ${firstName},</p>
      <p>${message}</p>
      <p style="font-size: 12px; color: gray;">This is an automated message. Do not reply.</p>
      <p style="font-size: 12px; color: gray;">© ${new Date().getFullYear()} Digital Clearance System</p>
    </div>
  `;

  return sendEmail(email, subject, html);
};
