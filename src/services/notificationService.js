import Notification from '../models/mongodb/notification.model.js';
import Event from '../models/mongodb/event.model.js';
import User from '../models/mongodb/user.model.js';

export const createEventReminderNotifications = async () => {
  try {
    // Find events starting in the next 24 hours
    const twentyFourHoursLater = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const upcomingEvents = await Event.find({
      eventTime: {
        $gte: new Date(),
        $lte: twentyFourHoursLater
      }
    }).populate('enrollments.userId');

    for (const event of upcomingEvents) {
      for (const enrollment of event.enrollments) {
        // Check if notification already exists
        const existingNotification = await Notification.findOne({
          userId: enrollment.userId,
          eventId: event._id,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (!existingNotification) {
          await Notification.create({
            userId: enrollment.userId,
            eventId: event._id,
            message: `Your event "${event.title}" is starting in 24 hours!`
          });
        }
      }
    }
  } catch (error) {
    console.error('Error creating event reminders:', error);
  }
};

export const getUserNotifications = async (userId) => {
  return await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .populate('eventId')
    .limit(10);
};

export const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};