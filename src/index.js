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
import proRoute from "./routes/proUser.route.js";
import path from 'path';
import { fileURLToPath } from "url";
import convRouter from "./routes/conversation.route.js";
import notificationRouter from "./routes/notification.route.js";

// Initialize express app
const app = express();
dotenv.config();
const port = process.env.PORT || 8000;

// Resolve __filename and __dirname correctly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available in routes
app.set('io', io);

// Socket.io connection logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});
// Middleware and routes
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Query:', req.query);
  console.log('Params:', req.params);
  next();
});
app.use('/api/auth', authRouter);
app.use('/api/conv', convRouter);

app.use('/api/event', EventRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/reservation', reservationRouter);
app.use('/api', searchRouter);
app.use("/api/messages", messageRouter);
app.use("/api/proUser", proRoute);
app.use("/api/notifications", notificationRouter);
// Serve static files from 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Start the server
server.listen(port, async () => {
  try {
    await connectDB();
    console.log('Server is running on port', port);
  } catch (err) {
    console.error('Failed to start the server:', err);
  }
});

// Export the socket.io instance
export { io };
