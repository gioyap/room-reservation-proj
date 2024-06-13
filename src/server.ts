import express, { Request, Response } from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import cors from "cors";
import { connect } from "@/utils/config/database"; // Adjust path as per your project structure
import Reservation from "@/utils/models/reservation";

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

// Define a route handler for GET /
app.get("/", (req, res) => {
	res.send("WebSocket server is running.");
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
	cors: {
		origin: [
			"http://localhost:3000",
			"https://reservation-system-nu.vercel.app",
			"http://localhost:3000/admin",
			"https://reservation-system-nu.vercel.app/admin",
		],
		methods: ["GET", "POST"],
	},
});

// Use the existing MongoDB connection
connect()
	.then((db) => {
		// Socket.IO event listeners
		io.on("connection", (socket: Socket) => {
			console.log("New client connected");

			socket.on("reservationUpdated", async (data) => {
				try {
					// Update reservation status in MongoDB
					const updatedReservation = await Reservation.findByIdAndUpdate(
						data.id,
						{ status: data.status },
						{ new: true }
					);

					// Broadcast updated reservation to all clients
					io.emit("reservationUpdate", updatedReservation);
				} catch (error) {
					console.error("Error updating reservation:", error);
				}
			});

			socket.on("disconnect", () => {
				console.log("Client disconnected");
			});
		});
	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error);
		process.exit(1); // Exit the process with an error code
	});

export const getSocketIOInstance = () => io;
