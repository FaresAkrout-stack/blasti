import Admin from '../models/admin.model.js'
import Event from '../models/event.model.js';
import { notifyProUser } from '../utils/notifyProUser.js';

export const approveEvent = async (req, res) => {
  const { eventId, status } = req.body; 

  try {
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, msg: 'Event not found' });
    }


    event.status = status;

    await event.save();


    await notifyProUser(event);

  
    res.status(200).json({ success: true, msg: `Event ${status} successfully`, event });
  } catch (err) {
    console.error('Error approving event:', err);
    res.status(500).json({ success: false, msg: 'Error approving event', error: err.message });
  }
};
export const deleteEvent = async (req, res) => {
  const { eventId, adminId } = req.body;

  try {
    // Check if admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({ success: false, msg: 'Unauthorized action' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, msg: 'Event not found' });
    }

    // Delete the event
    await event.deleteOne(); // No need to pass eventId here

    // Return success response
    res.status(200).json({ success: true, msg: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error); // Log the error for debugging
    res.status(500).json({ success: false, msg: 'Error deleting event' });
  }
};