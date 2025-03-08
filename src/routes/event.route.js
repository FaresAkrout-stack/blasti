import express from 'express';
import { enrollEvent, publishEvent } from '../controllers/event.controller.js';

const EventRouter = express.Router();

EventRouter.post('/publishEvent', publishEvent);
EventRouter.post('/enrollEvent',enrollEvent);

export default EventRouter;