import express from 'express';
import { approveEvent } from '../controllers/admin.controller.js';
const adminRouter=express.Router();
adminRouter.post('/approveEvent',approveEvent);
export default adminRouter; 