import express from 'express';
import { calculateRevenue, cancelEvent, createEventWithAI, enrollEvent, publishEvent, showRating, updateEventDetails } from '../controllers/event.controller.js';
import { checkBan } from '../middlewares/checkBan.middleware.js';

const EventRouter = express.Router();
EventRouter.post('/calculateRevenue',calculateRevenue);


EventRouter.use(checkBan);
EventRouter.post('/publishEvent', publishEvent);
EventRouter.post('/createAI',createEventWithAI);
EventRouter.post('/enrollEvent',enrollEvent);
EventRouter.post('/updateEvent',updateEventDetails);
EventRouter.delete('/cancelEvent',cancelEvent);
EventRouter.post('/showRating',showRating);

export default EventRouter;