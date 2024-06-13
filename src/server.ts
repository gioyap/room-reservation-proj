import express from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import cors from "cors";
import { connect } from "@/utils/config/database";
import Reservation from "@/utils/models/reservation";

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

const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: {
		origin: [
			"http://localhost:3000",
			"https://reservation-system-nu.vercel.app",
		],
		methods: ["GET", "POST"],
	},
});

connect()
	.then((db) => {
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
