const express = require('express');
const http = require('http');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
let port = process.env.PORT || 3000; // Port 3000 is the default port

const server = http.createServer(app);
let io = require('socket.io')(server); // Moved after defining server



app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("draw", (data) => {
        socket.broadcast.emit("draw", data);
    });

    socket.on("cursorMove", (data) => {
        socket.broadcast.emit("cursorMove", data);
    });

    socket.on("clearCanvas", () => {
        socket.broadcast.emit("clearcanvas");
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});




server.listen(port, () => console.log(`Server is running on port ${port}`));
