import express from 'express';
import { calculateRevenue, cancelEvent, /*createEventWithAI*/ enrollEvent,  getEventDetails, getEventsByCategory, getFilteredEvents, getTopRatedCategories, getTopRatedEvents, publishEvent, showRating, updateEventDetails } from '../controllers/event.controller.js';
import { checkBan } from '../middlewares/checkBan.middleware.js';
import { upload } from '../middlewares/multerMiddleware.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const EventRouter = express.Router();
EventRouter.post('/calculateRevenue',calculateRevenue);

EventRouter.get('/hello',getFilteredEvents);


EventRouter.get('/:category', getEventsByCategory);

EventRouter.get('/event/top-ratedEvents',getTopRatedEvents);
EventRouter.get('/top-rated', getTopRatedCategories);
EventRouter.get('/eve/:eventId', getEventDetails);

EventRouter.post(
    '/publishEvent/:proUserId',
    verifyToken,
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 }
    ]),
    publishEvent
  );
 
EventRouter.use(checkBan);
//EventRouter.post('/publishEvent', publishEvent);
//EventRouter.post('/createAI',createEventWithAI);
EventRouter.post('/updateEvent',updateEventDetails);
EventRouter.delete('/cancelEvent',cancelEvent);
EventRouter.post('/showRating',showRating);
// In your routes file





export default EventRouter;