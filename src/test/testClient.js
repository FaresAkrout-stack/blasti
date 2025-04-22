import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

socket.on("connect", () => {
  console.log("Connected to WebSocket server");

  socket.emit('sendMessage', {
    sender: '67cb7dd797c3ce65e81c7c4e',
    receiver: '67d8ba7f11cfb0ffa0ecd7fe',
    content: 'Hello, this is a test message!'
  });
});

socket.on("newMessage", (message) => {
  console.log("Received new message:", message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});
