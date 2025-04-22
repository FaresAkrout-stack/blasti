import User from "../models/mongodb/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { validatePassword } from "../utils/verifPass.js";
import { generateTokenAndSetCookie } from "../utils/generateCokAndToken.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail}from '../modules/email.js';
import { checkBan } from "../middlewares/checkBan.middleware.js";
import ProUser from "../models/mongodb/proUser.model.js";

	export const signup = async (req, res) => {
		const { email, password,userName } = req.body;
	  
		try {
		  const isExist = await User.findOne({ email });
		  if (isExist) {
			return res.status(400).json({ msg: "User already exists" });
		  }
	  
		  if (!validatePassword(password)) {
			return res.status(400).json({ msg: "Password must contain an uppercase letter, a symbol, and a number" });
		  }
	  
		  const hashedPass = password; 
		  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
	  
		  const newUser = new User({
			email,
			userName,
			password: hashedPass,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
		  });
	  
		  await newUser.save();
		  generateTokenAndSetCookie(res, newUser._id);
		  await sendVerificationEmail(email, verificationToken);
	  
		  res.status(200).json({ msg: "User created successfully" });
		} catch (err) {
		  console.error("Error creating user:", err);
		  res.status(500).json({ msg: "Error creating user", error: err.message });
		}
	  };
	export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
export const resendVerificationCode = async (req, res) => {
	const { email } = req.body;
	try {
	  const user = await User.findOne({ email });
	  if (!user || user.isVerified) {
		return res.status(400).json({ message: 'Invalid request' });
	  }
  
	  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
	  user.verificationToken = newCode;
	  user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
	  await user.save();
  
	  await sendVerificationEmail(email, newCode);
  
	  res.status(200).json({ message: "Verification code sent again" });
	} catch (err) {
	  res.status(500).json({ message: "Failed to resend verification code" });
	}
  };
  
export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}};
	export const login = async (req, res) => {
		const { email, password } = req.body;
	  
		try {
		  // Try to find a regular user
		  let user = await User.findOne({ email }).select("+password");
	  
		  // If user not found, try to find a ProUser
		  if (!user) {
			user = await ProUser.findOne({ email }).select("+password");
		  }
	  
		  if (!user) {
			return res.status(400).json({ success: false, message: "Invalid email" });
		  }
	  
		  console.log("Entered Password:", password);
		  console.log("Stored Hashed Password:", user.password);
	  
		  if (!user.password) {
			return res.status(500).json({ success: false, message: "Password not found for this user" });
		  }
	  
		  // Validate the entered password
		  const isPasswordValid = await bcrypt.compare(password, user.password);
		  if (!isPasswordValid) {
			console.log("Password does not match");
			return res.status(400).json({ success: false, message: "Invalid password" });
		  }
	  
		  // Check if the user is banned (optional)
		  const checkBanResult = await checkBan({ body: { userId: user._id } }, res, () => {});
		  if (checkBanResult) {
			return res.status(403).json({
			  success: false,
			  message: `You are banned until ${new Date(user.bannedUntil).toISOString()}`,
			});
		  }
	  
		  // Generate token and send it in the response
		  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
	  
		  // Set token in the response
		  res.status(200).json({
			success: true,
			message: "Logged in successfully",
			token, // Send token in the response body
			user: {
			  ...user._doc,
			  password: undefined, // Don't send password in the response
			},
		  });
	  
		  // Optionally update the last login time
		  user.lastLogin = new Date();
		  await user.save();
		} catch (error) {
		  console.error("Error in login: ", error);
		  res.status(400).json({ success: false, message: error.message });
		}
	  };
	
	export const logout = async (req, res) => {
		res.clearCookie("token");
		res.status(200).json({ success: true, message: "Logged out successfully" });
	};
	

export const updateDeviceToken = async (req, res) => {
    const { userId, deviceToken } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

      
        user.deviceToken = deviceToken;
        await user.save();

        res.status(200).json({ success: true, message: "Device token updated successfully" });
    } catch (error) {
        console.error("Error updating device token:", error);
        res.status(500).json({ success: false, message: "Error updating device token" });
    }
};
