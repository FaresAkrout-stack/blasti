import Event from "../models/mongodb/event.model.js";


export const rateEvent = async (req, res) => {
    const { eventId,rating,userId } = req.body;

    try {
        const event=await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        
        if (event.raters.includes(userId)) {
            return res.status(400).json({ success: false, message: "User has already rated this event" });
        }

        if (rating<1||rating>10) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 10" });
        }

    
        event.raters.push(userId); 
        event.ratings.push(rating);

        await event.save();

        res.status(200).json({success: true ,message:"Event rated successfully" });

    } catch (error) {
        console.error("Error rating event:", error);
        res.status(500).json({success: false,message: "Error rating event" });
    }
};