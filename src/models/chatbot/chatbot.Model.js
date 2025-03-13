import mongoose from 'mongoose';

const chatbotInteractionSchema = new mongoose.Schema({
    user_input: { type: String, required: true },
    predicted_intent: { type: String, required: true },
    chatbot_response: { type: String, required: true }
}, { timestamps: true });

const ChatbotInteraction = mongoose.model('ChatbotInteraction', chatbotInteractionSchema);

export default ChatbotInteraction;
