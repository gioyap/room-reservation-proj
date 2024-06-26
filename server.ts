// server.ts
import express from "express";
import { createServer } from "http";
import { connect } from "./utils/config/database.js";
import { Server as SocketIOServer, Socket } from "socket.io";
import Reservation from "./utils/models/reservation.js";

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
	cors: {
		origin: "https://calendar-reservation-enq3ce7zja-wl.a.run.app/",
		methods: ["GET", "POST"], // Add methods as needed
		allowedHeaders: ["Authorization"], // Add allowed headers as needed
		credentials: true, // Allow credentials (cookies, authorization headers, etc.)
	},
});

connect();

io.on("connection", (socket: Socket) => {
	console.log(`Client connected: ${socket.id}`);

	socket.on("disconnect", () => {
		console.log(`Client disconnected: ${socket.id}`);
	});
});

// Watch for changes in Reservation collection
Reservation.watch().on("change", (change) => {
	if (
		change.operationType === "update" &&
		change.updateDescription?.updatedFields?.status
	) {
		io.emit("newReservationStatus", change.fullDocument);
	}
});

app.get("/get", (req: any, res: { send: (arg0: string) => void }) => {
	res.send("GET request received!");
});

const PORT = process.env.EXPRESS_PORT || 3001;
httpServer.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
