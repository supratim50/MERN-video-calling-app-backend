require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const port = process.env.PORT || 5000;

userInRoom = {};

roomInUser = {};

io.on("connection", (socket) => {
  socket.on("join user", ({ roomID, roomName, name, imageUrl }) => {
    console.log("user joined!", socket.id);
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

    roomInUser[socket.id] = roomID;
    // fetch all users in the room
    const userInThisRoom = userInRoom[roomID].filter(
      (user) => user.userId != socket.id
    );
    socket.emit("all users", userInThisRoom);
  });

  // sending the signal
  socket.on("sending signal", ({ userToSignal, callerId, signal, roomID }) => {
    console.log("sending signal!!", userToSignal);
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

  // on disconnect
  socket.on("disconnect", () => {
    const roomId = roomInUser[socket.id];
    let room = userInRoom[roomId];
    if (room) {
      room = room.filter((user) => user.userId !== socket.id);
      userInRoom[roomId] = room;
    }
  });
});

server.listen(port, () => {
  console.log(`Server up and running on port number ${port}`);
});
