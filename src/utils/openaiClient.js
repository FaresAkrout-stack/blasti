import OpenAI from 'openai';


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});


export const generateEventDetails = async (prompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", 
            messages: [
                { role: "system", content: "You are a helpful assistant that generates creative event details." },
                { role: "user", content: prompt },
            ],
            max_tokens: 150, 
            temperature: 0.7, 
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generating event details:", error);
        throw error;
    }
};

export const generateEventImage = async (prompt) => {
    try {
        const response = await openai.images.generate({
            prompt: prompt,
            n: 1, 
            size: "512x512", 
        });

        return response.data[0].url; 
    } catch (error) {
        console.error("Error generating event image:", error);
        throw error;
    }
};

export default openai;