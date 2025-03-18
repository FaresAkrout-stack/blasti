import express from "express";
import { sendMessage, getMessages, markMessagesAsRead } from "../controllers/message.controller.js";

const messageRouter = express.Router();

messageRouter.post("/send", sendMessage);

messageRouter.get("/:user1/:user2", getMessages);

messageRouter.post("/mark-as-read", markMessagesAsRead);

export default messageRouter;
