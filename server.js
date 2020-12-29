require("dotenv").config();
const { Console } = require("console");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const port = process.env.PORT || 5000;

userInRoom = {};

ROOM_ID = "";

io.on("connection", (socket) => {
  // =================== VIDEO ======================
  socket.on("join user", ({ roomID, roomName, name, imageUrl }) => {
    // join user to the room
    socket.join(roomID);
    // check room is full or not
    if (userInRoom[roomID]) {
      const length = userInRoom[roomID].length;
      if (length === 4) {
        socket.emit("room full");
        return;
      }
      userInRoom[roomID].push({ userId: socket.id, roomName, name, imageUrl });
    } else {
      userInRoom[roomID] = [{ userId: socket.id, roomName, name, imageUrl }];
    }

    ROOM_ID = roomID;
    console.log("32", roomID);
    // fetch all users in the room
    const userInThisRoom = userInRoom[roomID].filter(
      (user) => user.userId != socket.id
    );
    socket.emit("all users", userInThisRoom);
  });

  // sending the signal
  socket.on("sending signal", ({ userToSignal, callerId, signal, roomID }) => {
    // sending my data to the connevtor
    const callerData = userInRoom[roomID].find(
      (user) => user.userId === socket.id
    );
    socket.to(userToSignal).emit("user join", callerId, signal, callerData);
  });

  // returning signal
  socket.on("returning signal", ({ callerId, signal }) => {
    socket.to(callerId).emit("recieving returning signal", {
      signal,
      id: socket.id,
    });
  });

  // ====================== CHAT =======================
  socket.on("sending message", (message) => {
    // fetching user ID
    const senderData = userInRoom[ROOM_ID].find(
      (user) => user.userId === socket.id
    );
    console.log("64", ROOM_ID, senderData, message);

    // sending message to the other users
    io.to(ROOM_ID).emit("message", { message, senderData });
  });

  // =================== On Disconnect ========================
  socket.on("disconnect", () => {
    console.log("user left");
    const roomId = ROOM_ID;
    let room = userInRoom[roomId];
    if (room) {
      room = room.filter((user) => user.userId !== socket.id);
      userInRoom[roomId] = room;
    }
    socket.broadcast.emit("user left", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server up and running on port number ${port}`);
});
