import express  from "express";
import dotenv from'dotenv'
import { connectDB } from "./lib/db.js";
import authRouter from "./routes/auth.route.js";
import EventRouter from "./routes/event.route.js";
import adminRouter from "./routes/admin.route.js";
import userRouter from "./routes/user.route.js";
import './cron/cronJobs.js';
import reservationRouter from "./routes/reservation.route.js";
import chatbotRouter from "./routes/chatbot.route.js";
import searchRouter from "./routes/search.route.js";
const app= express()
dotenv.config()
const port=process.env.PORT
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/event', EventRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/reservation',reservationRouter);
app.use('/api/chatbot',chatbotRouter);
app.use('/api',searchRouter);
app.listen(port, async () => {
    try {
      await connectDB();
      console.log('Server is running on port', port);
    } catch (err) {
      console.error('Failed to start the server:', err);
    }
  })