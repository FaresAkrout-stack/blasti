import { processUserInput } from '../utils/chatbotResponses.js';
import ChatbotInteraction from '../models/chatbot/chatbot.Model.js';  


export const getChatbotResponse = async (req, res) => {
  const { user_input } = req.body;

  try {
    
    const response = await processUserInput(user_input);


    const newInteraction = new ChatbotInteraction({
      user_input,
      predicted_intent: 'greetings', 
      chatbot_response: response.message,
    });

    await newInteraction.save();

 
    res.json({ response: response.message });

  } catch (error) {
    console.error('Error while processing user input:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
