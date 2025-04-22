import Message from "../models/mongodb/message.model.js";
import Conversation from "../models/mongodb/conversation.model.js";
import { io } from "../index.js";
import mongoose from "mongoose";
export const sendMessage = async (req, res) => {
  console.log("Received message request:", req.params, req.body);

  try {
    const { senderId, receiverId } = req.params;
    const { content, senderType = 'User', receiverType = 'User' } = req.body;

    // Validate required fields
    if (!senderId || !receiverId || !content || !senderType || !receiverType) {
      console.log("Missing required fields");
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // Normalize types to lowercase
    const normalizedSenderType = senderType.toLowerCase();
    const normalizedReceiverType = receiverType.toLowerCase();

    // Create the message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      receiverType
    });

    console.log("Created message:", message);

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: {
        $all: [
          { $elemMatch: { id: senderId, type: normalizedSenderType } },
          { $elemMatch: { id: receiverId, type: normalizedReceiverType } }
        ]
      }
    });

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [
          { id: senderId, type: normalizedSenderType },
          { id: receiverId, type: normalizedReceiverType }
        ],
        lastMessage: message._id
      });
      console.log("Created new conversation:", conversation);
    } else {
      // Update existing conversation
      conversation.lastMessage = message._id;
      await conversation.save();
      console.log("Updated existing conversation:", conversation);
    }

    // Emit socket event
    io.emit('newMessage', {
      ...message.toObject(),
      sender: { _id: senderId },
      receiver: { _id: receiverId }
    });

    res.status(201).json({ 
      success: true, 
      message: "Message sent successfully",
      data: {
        ...message.toObject(),
        sender: { _id: senderId },
        receiver: { _id: receiverId }
      }
    });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error sending message",
      error: error.message 
    });
  }
};
export const getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    })
    .sort({ createdAt: 1 })
    .lean() // Convert to plain JS objects
    .then(messages => messages.map(msg => ({
      ...msg,
      sender: { _id: msg.sender }, // Ensure sender is an object with _id
      receiver: { _id: msg.receiver } // Ensure receiver is an object with _id
    })));

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, msg: "Error fetching messages", error });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    await Message.updateMany(
      { sender, receiver, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, msg: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error marking messages", error });
  }
};
