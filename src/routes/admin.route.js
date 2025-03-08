import express from 'express';
import { approveEvent, deleteEvent } from '../controllers/admin.controller.js';
const adminRouter=express.Router();
adminRouter.post('/approveEvent',approveEvent);
adminRouter.delete('/deleteEvent',deleteEvent);
export default adminRouter;