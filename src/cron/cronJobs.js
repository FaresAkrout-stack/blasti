import cron from 'node-cron';
import Event from '../models/mongodb/event.model.js';


cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        const twelveHoursBeforeEvent = new Date(now.getTime() + 12 * 60 * 60 * 1000); 

        
        const events = await Event.find({
            eventTime: { $lte: twelveHoursBeforeEvent }, 
        });

        for (const event of events) {
           
            const confirmedEnrollments = event.enrollments.filter(enrollment => enrollment.confirmed);

          
            if (confirmedEnrollments.length !== event.enrollments.length) {
                event.enrollments = confirmedEnrollments;
                await event.save();
                console.log(`Removed unconfirmed reservations for event: ${event.title}`);
            }
        }
    } catch (error) {
        console.error("Error in cron job:", error);
    }
});