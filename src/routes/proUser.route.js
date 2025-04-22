import express from "express";
import { deleteEventById,  fetchEvent, fetchEventDashboardData, getAnalyticsStats, getProUserEventDates, updateEventById } from "../controllers/proUser.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const proRoute=express.Router();
proRoute.get('/events/:proUserId',verifyToken,fetchEventDashboardData);
proRoute.put('/update/:eventId',verifyToken ,updateEventById);
proRoute.delete('/delete/:eventId',verifyToken, deleteEventById);
proRoute.get('/event/:eventId',verifyToken, fetchEvent);
proRoute.get('/analyse/:userId', getAnalyticsStats);
proRoute.get('/calendar/:userId',getProUserEventDates);

export default proRoute;