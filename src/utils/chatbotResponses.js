import axios from 'axios'; // For making HTTP requests

export const processUserInput = async (userInput) => {
    try {
        // Call the Python microservice to predict the response
        const response = await axios.post('http://localhost:5000/predict', {
            user_input: userInput, // Send user input directly
        });

        console.log("Model Response:", response.data); // Debugging log

        // Extract response from model
        const chatbotResponse = response.data.response || "I'm not sure how to respond.";

        return { status: "success", message: chatbotResponse };
    } catch (error) {
        console.error("Error in processUserInput:", error);
        return { status: "error", message: "Chatbot response failed." };
    }
};