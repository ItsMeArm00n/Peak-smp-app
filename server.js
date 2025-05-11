const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static frontend files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, userName }) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ id: socket.id, name: userName });

    // Notify existing users
    socket.to(roomId).emit("user-joined", { id: socket.id, name: userName });

    // Send current users to new user
    socket.emit("all-users", rooms[roomId]);

    // Handle disconnect
    socket.on("disconnect", () => {
      rooms[roomId] = rooms[roomId]?.filter(u => u.id !== socket.id);
      socket.to(roomId).emit("user-left", socket.id);
    });

    // Broadcast mic/cam/chat/admin controls here...
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
