import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import bodyParser from "body-parser";
import { connect } from "@/utils/config/database";
import Reservation from "@/utils/models/reservation";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());

// Initialize MongoDB connection
connect()
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error.message);
		process.exit(1); // Exit the process with an error code
	});

app.post("/api/reservationDB", async (req, res) => {
	try {
		const reservation = new Reservation(req.body);
		await reservation.save();

		// Emit the new-reservation event to all connected clients
		io.emit("new-reservation", reservation);

		res.status(201).send({ reservation });
	} catch (error: any) {
		// Type assertion for 'error'
		res.status(400).send({ error: error.message });
	}
});

// API endpoint to get pending reservations
app.get("/api/status/pending", async (req, res) => {
	try {
		const reservations = await Reservation.find({ status: "Pending" });
		res.send({ reservations });
	} catch (error: any) {
		// Type assertion for 'error'
		res.status(500).send({ error: error.message });
	}
});

io.on("connection", (socket: Socket) => {
	console.log("a user connected");

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
