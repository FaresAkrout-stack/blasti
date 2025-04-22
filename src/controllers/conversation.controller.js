import mongoose from "mongoose";
import Conversation from "../models/mongodb/conversation.model.js";
import User from "../models/mongodb/user.model.js";
export const getAllConversationPartners = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      "participants.id": userId
    }).populate("lastMessage");

    const partners = [];

    for (let convo of conversations) {
      const partner = convo.participants.find(p => p.id.toString() !== userId);
      if (!partner) continue;

      let profile = null;
      if (partner.type === "user") {
        profile = await User.findById(partner.id).select("userName profilePic email");
      } else if (partner.type === "proUser") {
        profile = await ProUser.findById(partner.id).select("userName profilePic email");
      }

      if (profile) {
        console.log("Profile Picture for", partner.id, ":", profile.profilePic);

        partners.push({
          _id: partner.id,
          type: partner.type,
          userName: profile.usrName || profile.userName,
          avatar: profile.profilePic || profile.avatar || "/default-avatar.png",
          email: profile.email,
          lastMessage: convo.lastMessage?.content || "",
          lastMessageTime: convo.lastMessage?.createdAt || convo.updatedAt
        });
      }
    }

    partners.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.status(200).json({
      success: true,
      count: partners.length,
      users: partners
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error", error: err.message });
  }
};