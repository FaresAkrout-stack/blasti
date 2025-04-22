import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
	WELCOME_TEMPLATE,
} from "./emailTemplates.js";
import transporter from "./nodeMailer.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        if (!email || !verificationToken) {
            throw new Error("Email and verification token are required.");
        }

        if (!VERIFICATION_EMAIL_TEMPLATE.includes("{verificationCode}")) {
            throw new Error("VERIFICATION_EMAIL_TEMPLATE is invalid or missing placeholders.");
        }

        const recipient = email; 
		console.log(recipient);
		

        const response = transporter.sendMail({
            from: "mohamedrhaiem16@gmail.com",
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification",
        });

        console.log("Email sent successfully", response);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error(`Error sending verification email: ${error.message}`);
    }
};

export const sendWelcomeEmail = async (email, name) => {
    try {
        if (!email || !name) {
            throw new Error("Email and name are required.");
        }

        const recipient = email; 

        const response = await transporter.sendMail({
            from: "mohamedrhaiem16@gmail.com",
            to: recipient,
            subject: "Welcome to Auth Company",
            html: WELCOME_TEMPLATE.replace("{name}", name),
        });

        console.log("Welcome email sent successfully", response);
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw new Error(`Error sending welcome email: ${error.message}`);
    }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
    try {
        if (!email || !resetURL) {
            throw new Error("Email and reset URL are required.");
        }

        const recipient = email; 

        const response = await transporter.sendMail({
            from: "mohamedrhaiem16@gmail.com",
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
        });

        console.log("Password reset email sent successfully", response);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error(`Error sending password reset email: ${error.message}`);
    }
};

export const sendResetSuccessEmail = async (email) => {
    try {
        if (!email) {
            throw new Error("Email is required.");
        }

        const recipient = email;  
        const response = await transporter.sendMail({
            from: "mohamedrhaiem16@gmail.com",
            to: recipient,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        });

        console.log("Password reset success email sent successfully", response);
    } catch (error) {
        console.error("Error sending password reset success email:", error);
        throw new Error(`Error sending password reset success email: ${error.message}`);
    }
};