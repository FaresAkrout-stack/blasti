import express from 'express';
import { approveEvent, deleteEvent, fetchAllEvents, fetchAllUsers, systemStatistics } from '../controllers/admin.controller.js';
const adminRouter=express.Router();
adminRouter.post('/approveEvent',approveEvent);
adminRouter.delete('/deletEvent',deleteEvent);
adminRouter.post('/fetchAllUsers',fetchAllUsers);
adminRouter.post('/fetchAllEvents',fetchAllEvents);
adminRouter.post('/stats',systemStatistics);
export default adminRouter;