import express from 'express'
import { getChatbotResponse } from '../controllers/chatbot.controller.js';
const chatbotRouter=express.Router();
chatbotRouter.post('/chat',getChatbotResponse);
export default chatbotRouter;