const express = require("express");
const app = express();
const cors = require("cors");
const server = require("http").Server(app);
const io = require("socket.io")(server);
// creating the peer server
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, { debug: true });

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use("/peerjs", peerServer); // connect peer using middleware

io.on("connection", (socket) => {
  socket.on("newUserJoin", ({ name, imageUrl }, id) => {
    console.log(
      `New User Join. Name is ${name} image is ${imageUrl} and Id is ${id}`
    );
  });
});

app.get("/", (req, res) => {
  res.send("This is Server");
});

server.listen(PORT, () => {
  console.log(`Server up and running on ${PORT}`);
});
