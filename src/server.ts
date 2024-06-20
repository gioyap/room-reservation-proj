import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket: Socket) => {
	console.log("a user connected");

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});

	socket.on("new-reservation", (data: any) => {
		io.emit("update-reservations", data);
	});
});

server.listen(4000, () => {
	console.log("listening on *:4000");
});
