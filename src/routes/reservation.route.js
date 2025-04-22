import express from'express';
import { checkBan } from '../middlewares/checkBan.middleware.js';
import {  confirmReservation, createReservation } from '../controllers/reservation.controller.js';

const reservationRouter=express.Router();
reservationRouter.use(checkBan);
reservationRouter.post('/reserve',createReservation);
reservationRouter.post('/confirmReservation',confirmReservation);
export default reservationRouter;
