import express from 'express';
import { publishEvent, viewEvent } from '../controllers/event.controller.js';

const EventRouter = express.Router();

EventRouter.post('/publishEvent', publishEvent);
EventRouter.post('/viewEvent',viewEvent);

export default EventRouter;