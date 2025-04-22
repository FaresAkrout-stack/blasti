import express from'express';
import {  getCurrentUser, getUserBookings, getUserProfile, rateEvent, searchUsers,updateUserInfo,upgradeToProUser,uploadProfilePicture } from '../controllers/user.controller.js';
import  {upload} from '../middlewares/multerMiddleware.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { enrollEvent } from '../controllers/event.controller.js';
const userRouter=express.Router();
userRouter.post('/rateEvent',rateEvent);
userRouter.get("/search-users",  searchUsers);
userRouter.get('/me', verifyToken, getCurrentUser);
userRouter.post('/enroll',enrollEvent);
userRouter.post("/upload-profile-pic", verifyToken,upload.single("image"), uploadProfilePicture);
userRouter.put('/upgrade/:id', upgradeToProUser);
userRouter.get("/profile", verifyToken, getUserProfile);
userRouter.get('/user/:userId/my-bookings', verifyToken, getUserBookings);
userRouter.put("/updateUser/:userId", verifyToken, updateUserInfo);
userRouter.post("/enroll/:eventId",enrollEvent);


export default userRouter;