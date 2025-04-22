import Event from "../models/mongodb/event.model.js";
import Reservation from "../models/mongodb/reservation.model.js";
import User from "../models/mongodb/user.model.js";
import { scheduleNotification } from "../utils/notificationScheduler.js";

export const createReservation = async (req, res) => {
    try {
      const { eventId, places } = req.body;
      const userId = req.user._id;
  
      // Validate input
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
  
      if (!places || places <= 0) {
        return res.status(400).json({ message: 'Invalid number of places' });
      }
  
      // Check event availability
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      // Check if user already has a reservation for this event
      const existingReservation = await Reservation.findOne({
        userId,
        eventId
      });
  
      if (existingReservation) {
        return res.status(400).json({ message: 'You already have a reservation for this event' });
      }
  
      // Check capacity
      if (event.capacity < places) {
        return res.status(400).json({ message: 'Not enough places available' });
      }
  
      // Create reservation
      const reservation = new Reservation({
        userId,
        eventId,
        proUserId: event.proUserId,
        places,
        reservationTime: new Date()
      });
  
      await reservation.save();
  
      // Update event capacity
      event.capacity -= places;
      await event.save();
  
      res.status(201).json({
        success: true,
        reservation
      });
  
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ message: 'Error creating reservation' });
    }
  };
export const confirmReservation=async(req,res)=>{
    const {eventId,userId}=req.body;
    try {
        const event=await Event.findById(eventId);
        if(!event){
            return res.status(404).json({success:false,msg:"Event not found"});
            }
            const user=await User.findById(userId);
        if(!user){
                return res.status(404).json({success:false,msg:"User not found"});
                }
                const enrollmentIndex = event.enrollments.findIndex(enrollment => enrollment.userId.equals(userId));
        if (enrollmentIndex === -1) {
                    return res.status(400).json({ success: false, message: "User does not have a reservation for this event" });
        }

        event.enrollments[enrollmentIndex].confirmed = true;
        await event.save();

        res.status(200).json({success:true,msg:'reservationn confirmed successfully '});
        
        
    } catch (error) {
        res.status(500).json({success:false,msg:'error confirming reservation'});
    }

}