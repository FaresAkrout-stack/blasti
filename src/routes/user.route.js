import express from'express';
import {  rateEvent, updatePassword, updateUser } from '../controllers/user.controller.js';
const userRouter=express.Router();
userRouter.post('/rateEvent',rateEvent);
userRouter.post('/updateUser',updateUser);
userRouter.post('/updateUserPassword',updatePassword);

export default userRouter;