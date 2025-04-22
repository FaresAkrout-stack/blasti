import express from 'express'
import { getAllConversationPartners } from '../controllers/conversation.controller.js';
const convRouter=express.Router();
convRouter.get("/convo/:userId", getAllConversationPartners);
export default convRouter;