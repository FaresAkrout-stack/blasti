import express from 'express'
import { searchEvents } from '../controllers/search.controller.js';
const searchRouter=express.Router();
searchRouter.post('/search',searchEvents);
export default searchRouter;
