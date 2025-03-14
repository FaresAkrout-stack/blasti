import express from'express';
import { checkBan } from '../middlewares/checkBan.middleware.js';
import { cancelReservation, confirmReservation, makeReservation } from '../controllers/reservation.controller.js';

const reservationRouter=express.Router();
reservationRouter.use(checkBan);
reservationRouter.post('/makeReservation',makeReservation);
reservationRouter.post('/cancelReservation',cancelReservation);
reservationRouter.post('/confirmReservation',confirmReservation);
export default reservationRouter;
