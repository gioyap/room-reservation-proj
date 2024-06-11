import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

// Initialize Express app
const app = express();
app.use(
	cors({
		origin: [
			"http://localhost:3000",
			"https://reservation-system-nu.vercel.app",
		],
		methods: ["GET", "POST"],
	})
);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
	cors: {
		origin: [
			"http://localhost:3000",
			"https://reservation-system-nu.vercel.app",
		],
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket: Socket) => {
	console.log("New client connected");

	socket.on("reservationUpdated", (data) => {
		io.emit("reservationUpdate", data); // Broadcast to all clients
	});

	socket.on("disconnect", () => {
		console.log("Client disconnected");
	});
});

const PORT = process.env.EXPRESS_PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
