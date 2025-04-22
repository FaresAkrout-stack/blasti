import cron from 'node-cron';
import { createEventReminderNotifications } from '../services/notificationService.js';

// Run every hour to check for upcoming events
cron.schedule('0 * * * *', async () => {
  console.log('Running notification check...');
  await createEventReminderNotifications();
});