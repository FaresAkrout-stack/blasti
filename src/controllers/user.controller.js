import Event from "../models/mongodb/event.model.js";
import User from "../models/mongodb/user.model.js";
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import ProUser from '../models/mongodb/proUser.model.js'; 


export const rateEvent = async (req, res) => {
    const { eventId,rating,userId } = req.body;

    try {
        
        const event=await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        
        if (event.raters.includes(userId)) {
            return res.status(400).json({ success: false, message: "User has already rated this event" });
        }

        if (rating<1||rating>10) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 10" });
        }

    
        event.raters.push(userId); 
        event.ratings.push(rating);

        await event.save();

        res.status(200).json({success: true ,message:"Event rated successfully" });

    } catch (error) {
        console.error("Error rating event:", error);
        res.status(500).json({success: false,message: "Error rating event" });
    }
};

import { validatePassword } from "../utils/verifPass.js";
import { generateTokenAndSetCookie } from "../utils/generateCokAndToken.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail}from '../modules/email.js';
import { checkBan } from "../middlewares/checkBan.middleware.js";

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
			const checkBanResult = await checkBan({ body: { userId: user._id } }, res, () => {});

			if (checkBanResult) {
			  return res.status(403).json({
				success: false,
				message: `You are banned until ${new Date(user.bannedUntil).toISOString()}`,
			  });
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
};export const uploadProfilePicture = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
  
    const userId = req.userId; // or from params
    const filePath = req.file.path;
  console.log(userId)
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
  
      // Save relative file path to user profile
      user.profilePic = filePath;
      await user.save();
  
      const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${filePath}`;
  
      res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        profilePic: fullUrl,  // Send the full URL to the frontend
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };
  export const upgradeToProUser = async (req, res) => {
	try {
	  const userId = req.params.id;
  
	  // 1. Find user by ID
	  const user = await User.findById(userId);
  
	  if (!user) {
		return res.status(404).json({ message: "User not found" });
	  }
  
	  // 2. Create a new ProUser document, include all required fields including password
	  const proUser = new ProUser({
		email: user.email,
		userName: user.userName,
		password: user.password, // ✅ this MUST be included
		profilePic: user.profilePic,
		isVerified: user.isVerified,
		lastLogin: user.lastLogin,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		role: 'proUser'
	  });
  
	  await User.findByIdAndDelete(userId);
	  await proUser.save();
  
	  // 4. Delete the original User
	  
  
	  // 5. Send response
	  res.status(200).json({ message: 'User upgraded to proUser and moved to ProUser table', proUser });
  
	} catch (error) {
	  console.error('Error upgrading user role:', error);
	  res.status(500).json({ message: 'Internal server error' });
	}
  };
  export const getUserProfile = async (req, res) => {
	try {
	  const user = await User.findById(req.userId).select("userName email profilePic");
  
	  if (!user) {
		return res.status(404).json({ success: false, message: "User not found" });
	  }
  
	  // Clean up the profilePic to only keep the filename if needed
	  if (user.profilePic?.includes("uploads/")) {
		user.profilePic = user.profilePic.split("uploads/")[1];
	  }
  
	  res.status(200).json({ success: true, user });
	} catch (error) {
	  console.error("Error fetching user profile:", error);
	  res.status(500).json({ success: false, message: "Error fetching user profile" });
	}
  };
  // userController.js


// Fetch bookings for a specific user
export const getUserBookings = async (req, res) => {
	const { userId } = req.params;
  
	try {
	  // Fetch events where the user is enrolled and their enrollment is confirmed
	  const events = await Event.find({
		'enrollments.userId': userId,
		'enrollments.confirmed': true,  // Ensure the enrollment is confirmed
	  });
  
	  console.log("Fetched Events: ", events);  // Log fetched events
  
	  // If no events are found
	  if (events.length === 0) {
		return res.status(200).json({
		  success: false,
		  message: 'No confirmed bookings found for this user.',
		  bookings: [],
		});
	  }
  
	  // Map the events to the format required by the frontend
	  const bookings = events.map(event => ({
		id: event._id,
		name: event.title,
		description: event.description,
		date: event.eventTime,  // Ensure you're using the correct date field
		image_url: event.image || "",  // Use the image field from your event model
	  }));
  
	  // Respond with success and the list of bookings
	  res.status(200).json({
		success: true,
		bookings
	  });
	} catch (error) {
	  console.error("Error fetching bookings:", error);
	  res.status(500).json({ success: false, message: "Failed to fetch bookings" });
	}
  };
  export const getCurrentUser = async (req, res) => {
	try {
	  // Use req.userId as set by verifyToken
	  const user = await User.findById(req.userId).select('-password');
	  
	  if (!user) {
		return res.status(404).json({ 
		  success: false, 
		  message: 'User not found' 
		});
	  }
	  
	  res.status(200).json({ 
		success: true, 
		user 
	  });
	} catch (err) {
	  console.error('Error fetching user:', err);
	  res.status(500).json({ 
		success: false,
		message: 'Error fetching user', 
		error: err.message 
	  });
	}
  };
  export const searchUsers = async (req, res) => {
	try {
	  const query = req.query.userName;
  
	  if (!query) {
		return res.status(400).json({ message: "Query parameter 'username' is required" });
	  }
  
	  // Search both User and ProUser collections (assuming similar schema)
	  const users = await User.find({ userName: { $regex: query, $options: "i" } }).select('-password');
	  const pros = await ProUser.find({ userName: { $regex: query, $options: "i" } }).select('-password');
  
	  const merged = [...users.map(u => ({ ...u.toObject(), role: 'user' })), ...pros.map(p => ({ ...p.toObject(), role: 'pro' }))];
  
	  res.status(200).json(merged);
	} catch (err) {
	  console.error("Search error:", err);
	  res.status(500).json({ message: "Internal server error" });
	}
  };
  export const updateUserInfo = async (req, res) => {
	const { userId } = req.params;  // Get userId from URL parameter
	const { currentPassword, newPassword, userName, email } = req.body;
  
	console.log("User ID received:", userId);  // Debugging the received userId
  
	if (!userId) {
	  return res.status(400).json({ success: false, msg: "User ID is required" });
	}
  
	// Validate ObjectId format
	const objectId = mongoose.Types.ObjectId.isValid(userId)
	  ? new mongoose.Types.ObjectId(userId)
	  : null;
  
	if (!objectId) {
	  return res.status(400).json({ success: false, msg: "Invalid user ID" });
	}
  
	const updates = { ...req.body };
  
	try {
	  // Find the user by ID
	  let user = await User.findById(objectId);
	  if (!user) {
		return res.status(404).json({ success: false, msg: "User not found" });
	  }
  
	  // Check if the email or username is being updated and ensure no conflicts
	  if (email && email !== user.email) {
		const existingEmailUser = await User.findOne({ email });
		if (existingEmailUser) {
		  return res.status(400).json({ success: false, msg: "Email is already in use" });
		}
	  }
  
	  if (userName && userName !== user.userName) {
		const existingUserName = await User.findOne({ userName });
		if (existingUserName) {
		  return res.status(400).json({ success: false, msg: "Username is already in use" });
		}
	  }
  
	  // If password fields are provided, validate and update password
	  if (currentPassword && newPassword) {
		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
		  return res.status(400).json({ success: false, msg: "Current password is incorrect" });
		}
  
		// Hash new password and update
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);
	  }
  
	  // If no password is provided, exclude it from updates
	  if (!currentPassword && !newPassword) {
		delete updates.currentPassword;
		delete updates.newPassword;
	  }
  
	  // Remove restricted fields from updates
	  const restrictedFields = [
		"role", "lastLogin", "bannedUntil", "deviceToken", "isVerified",
		"resetPasswordToken", "resetPasswordExpiresAt", "verificationToken", "verificationTokenExpiresAt"
	  ];
	  restrictedFields.forEach(field => delete updates[field]);
  
	  // Apply updates directly to the user object
	  user = Object.assign(user, updates);
  
	  // Save the updated user data to the database
	  await user.save(); // This stores the updated data in the database
  
	  // Send the updated user info in the response
	  res.status(200).json({
		success: true,
		msg: "User updated successfully",
		updatedUser: user,
	  });
	} catch (error) {
	  console.error("Error updating user:", error);
	  res.status(500).json({ success: false, msg: "Error updating user" });
	}
  };
  export const enrollInEvent = async (req, res) => {
	try {
	  const { eventId } = req.params; // Changed from req.body to req.params
	  const userId = req.user._id;
	  const user = req.user;
  
	  // Validate input
	  if (!mongoose.Types.ObjectId.isValid(eventId)) {
		return res.status(400).json({ message: 'Invalid event ID' });
	  }
  
	  // Check event exists
	  const event = await Event.findById(eventId);
	  if (!event) {
		return res.status(404).json({ message: 'Event not found' });
	  }
  
	  // Check if user already enrolled
	  const alreadyEnrolled = event.enrollments.some(
		enrollment => enrollment.userId.toString() === userId.toString()
	  );
  
	  if (alreadyEnrolled) {
		return res.status(400).json({ message: 'You are already enrolled in this event' });
	  }
  
	  // Add enrollment
	  event.enrollments.push({
		userId,
		confirmed: true,
		userInfo: {
		  name: user.name,
		  email: user.email,
		  deviceType: req.headers['user-agent'] || 'unknown',
		  location: req.ip
		}
	  });
  
	  event.enrollmentsCount += 1;
	  await event.save();
  
	  res.status(200).json({
		success: true,
		message: 'Successfully enrolled in event'
	  });
  
	} catch (error) {
	  console.error('Error enrolling in event:', error);
	  res.status(500).json({ message: 'Error enrolling in event' });
	}
  };