const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {};

io.on("connection", (socket) => {

  socket.on("join-room", (roomId) => {

    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push(socket.id);

    io.to(roomId).emit("users-update", rooms[roomId]);

    socket.to(roomId).emit("user-joined", socket.id);

  });

  socket.on("offer", ({ offer, to }) => {
    io.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, to }) => {
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    io.to(to).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("disconnect", () => {

    for (const roomId in rooms) {

      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);

      io.to(roomId).emit("users-update", rooms[roomId]);

    }

  });

});

server.listen(8080, () =>
  console.log("Server running on port 8080")
);