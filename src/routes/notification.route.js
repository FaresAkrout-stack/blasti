import express from 'express';
import { getUserNotifications, markAsRead } from '../services/notificationService.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const notificationRouter = express.Router();

notificationRouter.get('/', verifyToken, async (req, res) => {
    try {
      const notifications = await getUserNotifications(req.user._id);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Error fetching notifications' });
    }
  });
  
  // Mark notification as read
  notificationRouter.put('/:id/read', verifyToken ,async (req, res) => {
    try {
      const notification = await markAsRead(req.params.id);
      
      // Emit notification update to the user
      const io = req.app.get('io');
      if (io) {
        io.to(req.user._id.toString()).emit('notificationUpdate', notification);
      }
      
      res.json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Error marking notification as read' });
    }
  });
  
  // Mark all notifications as read
  notificationRouter.put('/mark-all-read', verifyToken,async (req, res) => {
    try {
      // Implementation would go here
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Error marking all notifications as read' });
    }
  });
export default notificationRouter;