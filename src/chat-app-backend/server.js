const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 5000;

const user_list = [
  { name: "Alan" },
  { name: "Bob" },
  { name: "Carol" },
  { name: "Dean" },
  { name: "Elin" }
];

io.on("connection", (socket) => {
  console.log("User connected");

  // Listen for new messages from clients
  socket.on("newMessage", (message) => {
    io.emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
