const { Socket } = require("dgram");
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 4000;

const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(cors());

io.on("connection", (socket) => {
  socket.on("newUserJoin", ({ userName, imageUrl }) => {
    console.log(`New User Join. Name is ${userName}image is ${imageUrl}`);
  });
});

app.get("/", (req, res) => {
  res.send("This is Server");
});

server.listen(PORT, () => {
  console.log(`Server up and running on ${PORT}`);
});
