import express from 'express';
import { calculateRevenue, cancelEvent, enrollEvent, publishEvent, showRating, updateEventDetails } from '../controllers/event.controller.js';

const EventRouter = express.Router();

EventRouter.post('/publishEvent', publishEvent);
EventRouter.post('/enrollEvent',enrollEvent);
EventRouter.post('/updateEvent',updateEventDetails);
EventRouter.delete('/cancelEvent',cancelEvent);
EventRouter.post('/calculateRevenue',calculateRevenue);
EventRouter.post('/showRating',showRating);

export default EventRouter;