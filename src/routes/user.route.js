import express from'express';
import {  rateEvent } from '../controllers/user.controller.js';
const userRouter=express.Router();
userRouter.post('/rateEvent',rateEvent);
export default userRouter;