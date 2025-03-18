import Event from "../models/mongodb/event.model.js";
import User from "../models/mongodb/user.model.js";
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
export const updateUser = async (req, res) => {
  const { userId } = req.body;
  const updates = { ...req.body };

  try {
      const objectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
      if (!objectId) {
          return res.status(400).json({ success: false, msg: "Invalid user ID" });
      }

      const restrictedFields = [
          "role", "lastLogin", "bannedUntil", "deviceToken", "isVerified", 
          "resetPasswordToken", "resetPasswordExpiresAt", "verificationToken", "verificationTokenExpiresAt",
          "password" 
      ];
      restrictedFields.forEach(field => delete updates[field]);

      
      let user = await User.findById(objectId).lean();
      if (!user) {
          return res.status(404).json({ success: false, msg: "User not found" });
      }

     
      if (updates.email) {
          const existingUser = await User.findOne({ email: updates.email, _id: { $ne: objectId } });
          if (existingUser) {
              return res.status(400).json({ success: false, msg: "Email is already in use" });
          }
      }

      if (updates.userName) {
          const existingUser = await User.findOne({ userName: updates.userName, _id: { $ne: objectId } });
          if (existingUser) {
              return res.status(400).json({ success: false, msg: "Username is already in use" });
          }
      }

     
      const updatedUser = await User.findByIdAndUpdate(objectId, updates, { new: true }).lean();
      res.status(200).json({ success: true, msg: "User updated successfully", data: updatedUser });
  } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ success: false, msg: "Error updating user" });
  }
};


export const updatePassword = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    try {
      
        const objectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
        if (!objectId) {
            return res.status(400).json({ success: false, msg: "Invalid user ID" });
        }

       
        let user = await User.findById(objectId).select("+password");
        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }

     
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, msg: "Old password is incorrect" });
        }

        
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, msg: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ success: false, msg: "Error updating password" });
    }
};
