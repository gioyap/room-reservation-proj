// server.ts

import express from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import cors from "cors";
import { connect } from "@/utils/config/database"; // Adjust path as per your project structure
import Reservation from "@/utils/models/reservation"; // Adjust path as per your project structure

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
	cors: {
		origin: [
			"http://localhost:3000",
			"https://reservation-system-nu.vercel.app",
		],
		methods: ["GET", "POST"],
	},
});

// Middleware
app.use(
	cors({
		origin: [
			"http://localhost:3000",
			"https://reservation-system-nu.vercel.app",
		],
		methods: ["GET", "POST"],
	})
);

// Connect to database
connect();

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
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

export default io;
export const getSocketIOInstance = () => io;
