import { io } from "socket.io-client";

// Connect to the WebSocket server
const socket = io("http://localhost:8000");

socket.on("connect", () => {
  console.log("Connected to WebSocket server");

  // Send a test message after connecting
  socket.emit('sendMessage', {
    sender: '67cb7dd797c3ce65e81c7c4e',
    receiver: '67d8ba7f11cfb0ffa0ecd7fe',
    content: 'Hello, this is a test message!'
  });
});

// Listen for the "newMessage" event (message broadcasted from server)
socket.on("newMessage", (message) => {
  console.log("Received new message:", message);
});

// Listen for socket disconnect
socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});
