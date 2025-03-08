import express from 'express';
import { publishEvent } from '../controllers/event.controller.js';

const EventRouter = express.Router();

EventRouter.post('/publishEvent', publishEvent);

export default EventRouter;