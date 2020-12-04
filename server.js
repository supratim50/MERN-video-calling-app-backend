require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const port = process.env.PORT || 5000;

io.on("connection", (socket) => {
  socket.on("join user", ({ roomID, roomName }) => {
    console.log(`room name ${roomName} room id ${roomID}`);
  });
});

server.listen(port, () => {
  console.log(`Server up and running on port number ${port}`);
});
