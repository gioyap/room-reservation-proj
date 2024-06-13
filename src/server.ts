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
			"https://reservation-system-nu.vercel.app/admin/pending",
			"https://reservation-system-nu.vercel.app/admin/declined",
			"https://reservation-system-nu.vercel.app/admin/accepted",
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
			"https://reservation-system-nu.vercel.app/admin/pending",
			"https://reservation-system-nu.vercel.app/admin/declined",
			"https://reservation-system-nu.vercel.app/admin/accepted",
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
					const updatedReservation = await Reservation.findByIdAndUpdate(
						data.id,
						{ status: data.status },
						{ new: true }
					);

					const pendingReservations = await Reservation.find({
						status: "Pending",
					});
					const acceptedReservations = await Reservation.find({
						status: "Accepted",
					});
					const declinedReservations = await Reservation.find({
						status: "Declined",
					});

					io.emit("pendingReservations", pendingReservations);
					io.emit("acceptedReservations", acceptedReservations);
					io.emit("declinedReservations", declinedReservations);
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
		process.exit(1);
	});

export const getSocketIOInstance = () => io;
