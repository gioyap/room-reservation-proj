// server.ts

import express from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import cors from "cors";
import { connect } from "../utils/config/database";
import Reservation from "../utils/models/reservation"; // Adjust path as per your project structure

const app = express();
const server = http.createServer(app);

// Connect to database
connect();

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
	cors: {
		origin: ["https://reservation-system-nu.vercel.app"],
		methods: ["GET", "POST"],
	},
});

// Middleware
app.use(
	cors({
		origin: ["https://reservation-system-nu.vercel.app"],
		methods: ["GET", "POST"],
	})
);

// Socket.IO server events
io.on("connection", (socket: Socket) => {
	console.log("New client connected");

	socket.on("disconnect", () => {
		console.log("Client disconnected");
	});
});

// Handle reservation updates
export const handleReservationUpdate = async (reservationId: string) => {
	try {
		const updatedReservation = await Reservation.findById(reservationId);
		if (updatedReservation) {
			io.emit("reservationUpdate", updatedReservation.toJSON());
		}
	} catch (error) {
		console.error("Error handling reservation update:", error);
	}
};

// Example route handler for GET /
app.get("/", (req, res) => {
	res.send("WebSocket server is running.");
});

// Start server
const PORT = process.env.EXPRESS_PORT || 0;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

export default io;
export const getSocketIOInstance = () => io;
