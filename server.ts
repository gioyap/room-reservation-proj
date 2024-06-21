// server.ts
import express from "express";
import { createServer } from "http";
import { connect } from "./utils/config/database";
import { Server as SocketIOServer, Socket } from "socket.io";
import Reservation from "./utils/models/reservation";

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
	cors: {
		origin: "*", // Adjust this to your frontend URL in production
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
Reservation.watch().on(
	"change",
	(change: { operationType: string; fullDocument: { status: string } }) => {
		if (
			change.operationType === "insert" &&
			change.fullDocument.status === "Pending"
		) {
			io.emit("newReservation", change.fullDocument);
		}
	}
);

const PORT = process.env.EXPRESS_PORT || 3001;
httpServer.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
