import Event from "../models/mongodb/event.model.js";
import Reservation from "../models/mongodb/reservation.model.js";
import User from "../models/mongodb/user.model.js";
import { scheduleNotification } from "../utils/notificationScheduler.js";

export const  makeReservation=async(req,res)=>{
    const {eventId,userId}=req.body;
    try{
        const event=await Event.findById(eventId);
        if(!event){ 
            return res.status(404).json({message:"Event not found"});}
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        if (event.enrollments.some(enrollment => enrollment.userId.toString() === userId)) {
            return res.status(400).json({ success: false, message: "User has already made a reservation for this event" });
        }

        if(event.enrollmentsCount>=event.capacity){
            return res.status(400).json({ success:false,message:"Event is full"});
        }
        event.enrollments.push({ userId, confirmed: false });
        event.enrollmentsCount++;
        await event.save();
        const reservation = new Reservation({
            userId,
            eventId,
            reservationTime: new Date(), 
        });

       
        await reservation.save();
        const eventTime=event.eventTime;
        const now =new Date();  
        let timeUntilEvent=eventTime-now;
        let interval =3*24*60*60*1000;//3j
        while(timeUntilEvent>interval){
            scheduleNotification(userId,`Reminder event ${event.title} is coming up`, new Date(now.getTime()+interval));
            interval+=3*24*60*60*1000;
        }
        scheduleNotification(userId,`final  event reminder${event.title}is in 24 hours`,new Date(eventTime.getTime()- 24*60*60*1000));
        res.status(200).json({success:true,msg:'reservation successful'});
    }

    catch(err){
        console.log(err);
        res.status(500).json({sucess:false,msg:'error making reservation'})
    }
};
export const cancelReservation = async (req, res) => {
    const { eventId, userId } = req.body;

    try {
    
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

      
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const enrollmentIndex = event.enrollments.findIndex(enrollment => enrollment.userId.toString() === userId);
        if (enrollmentIndex === -1) {
            return res.status(400).json({ success: false, message: "User does not have a reservation for this event" });
        }

        event.enrollments.splice(enrollmentIndex, 1);

        
        event.enrollmentsCount--;

        await event.save();
        await Reservation.findOneAndDelete({ eventId, userId });

        scheduleNotification(userId, `Your reservation for "${event.title}" has been canceled.`, new Date());

        res.status(200).json({ success: true, message: "Reservation canceled successfully" });
    } catch (error) {
        console.error("Error canceling reservation:", error);
        res.status(500).json({ success: false, message: "Error canceling reservation" });
    }
};