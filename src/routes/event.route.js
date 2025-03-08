import express from 'express';
import { cancelEvent, enrollEvent, publishEvent, updateEventDetails } from '../controllers/event.controller.js';

const EventRouter = express.Router();

EventRouter.post('/publishEvent', publishEvent);
EventRouter.post('/enrollEvent',enrollEvent);
EventRouter.post('/updateEvent',updateEventDetails);
EventRouter.delete('/cancelEvent',cancelEvent);

export default EventRouter;