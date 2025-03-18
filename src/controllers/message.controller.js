import Message from "../models/mongodb/message.model.js";
import Conversation from "../models/mongodb/conversation.model.js";
import { io } from "../index.js";

export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [sender, receiver],
      });
    }

    // Save message
    const message = await Message.create({ sender, receiver, content });

    // Update conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    // Emit message in real time
    io.to(receiver).emit("newMessage", message);
    io.to(sender).emit("messageSent", message);

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, msg: "Error sending message", error });
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
      }).sort({ createdAt: 1 });
  
      res.status(200).json({ success: true, messages });
    } catch (error) {
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
    