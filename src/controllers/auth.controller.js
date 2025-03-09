import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
import { validatePassword } from "../utils/verifPass.js";
import { generateTokenAndSetCookie } from "../utils/generateCokAndToken.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail}from '../modules/email.js';

	export const signup = async (req, res) => {
		const { email, password } = req.body;
	  
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

		await sendWelcomeEmail(user.email, user.name);

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
			
			const user = await User.findOne({ email }).select("+password");
	
			if (!user) {
				return res.status(400).json({ success: false, message: "Invalid email" });
			}
	
			console.log("Entered Password:", password);
			console.log("Stored Hashed Password:", user.password);
	
			if (!user.password) {
				return res.status(500).json({ success: false, message: "Password not found for this user" });
			}
	
			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) {
				console.log("Password does not match");
				return res.status(400).json({ success: false, message: "Invalid password" });
			}
	
			
			generateTokenAndSetCookie(res, user._id);
			user.lastLogin = new Date();
			await user.save();
	
			res.status(200).json({
				success: true,
				message: "Logged in successfully",
				user: {
					...user._doc,
					password: undefined, 
				},
			});
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