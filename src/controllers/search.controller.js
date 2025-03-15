import Event from "../models/mongodb/event.model.js";

export const searchEvents = async (req, res) => {
  try {
    const { query } = req.query; 

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

   
    const events = await Event.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { eventCategorie: { $regex: query, $options: 'i' } }, 
      ],
    }).populate('userId', 'username email') 
      .populate('proUserId', 'username email'); 

    if (events.length === 0) {
      return res.status(404).json({ success:false ,message: 'No events found' });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error searching events', error: error.message });
  }
};

