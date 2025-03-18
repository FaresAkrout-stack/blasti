import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRouter from "./routes/auth.route.js";
import EventRouter from "./routes/event.route.js";
import adminRouter from "./routes/admin.route.js";
import userRouter from "./routes/user.route.js";
import './cron/cronJobs.js';
import reservationRouter from "./routes/reservation.route.js";
import searchRouter from "./routes/search.route.js";
import messageRouter from "./routes/message.route.js";
import http from "http";
import { Server } from "socket.io";


const app = express();
dotenv.config();
const port = process.env.PORT || 8000;


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*",  
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", (message) => {
    console.log("Message received:", message);
    socket.broadcast.emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/event', EventRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/reservation', reservationRouter);
app.use('/api', searchRouter);
app.use("/api/messages", messageRouter);

server.listen(port, async () => {
  try {
    await connectDB();
    console.log('Server is running on port', port);
  } catch (err) {
    console.error('Failed to start the server:', err);
  }
});

export { io };
