import ChatbotInteraction from '../models/chatbot/chatbot.Model.js';
import { processUserInput } from '../utils/chatbotResponses.js';


export const getChatbotResponse = async (req, res) => {
    try {
        const { user_input } = req.body;

   
        if (!user_input || typeof user_input !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing user input' });
        }

    
        const response = await processUserInput(user_input);

        if (!response) {
            return res.status(500).json({ error: 'Failed to get response from chatbot' });
        }

       
        const newInteraction = new ChatbotInteraction({
            user_input,
            predicted_intent: 'example_intent', 
            chatbot_response: response
        });

        await newInteraction.save();

        res.json({ response });
    } catch (error) {
        console.error('Error processing chatbot response:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
