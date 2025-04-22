import mongoose from "mongoose";
const conversationSchema = new mongoose.Schema(
    {
      participants: [
        {
          id: { type: mongoose.Schema.Types.ObjectId, required: true },
          type: { type: String, enum: ["user", "proUser"], required: true },
        },
      ],
      lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    },
    { timestamps: true }
  );
  
  const Conversation = mongoose.model("Conversation", conversationSchema);
  export default Conversation;