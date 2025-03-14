import express from 'express';
import { approveEvent, deleteEvent, fetchAllUsers } from '../controllers/admin.controller.js';
const adminRouter=express.Router();
adminRouter.post('/approveEvent',approveEvent);
adminRouter.delete('/deletEvent',deleteEvent);
adminRouter.post('/fetchAllUsers',fetchAllUsers);
export default adminRouter;