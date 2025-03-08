import express from 'express';
import { enrollEvent, publishEvent, updateEventDetails } from '../controllers/event.controller.js';

const EventRouter = express.Router();

EventRouter.post('/publishEvent', publishEvent);
EventRouter.post('/enrollEvent',enrollEvent);
EventRouter.post('/updateEvent',updateEventDetails);

export default EventRouter;