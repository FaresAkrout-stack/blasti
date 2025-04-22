import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, refPath: 'receiverType', required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    receiverType: { type: String, enum: ['User', 'ProUser','user','proUser'], required: true }, // Added discriminator field
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
