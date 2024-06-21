// server.ts
import { createServer } from "http";
import express from "express";
import { connect } from "./utils/config/database";
import { Server } from "ws";
import Reservation from "./utils/models/reservation";

const app = express();
const server = createServer(app);
const wss = new Server({ server });

connect();

wss.on("connection", (ws) => {
	console.log("Client connected");

	// Simulated reservation data
	const newReservation = {
		_id: "some_id",
		company: "Flawless",
		department: "Executives",
		name: "John Doe",
		title: "Meeting Room",
		fromDate: "2024-06-22T10:00:00Z",
		toDate: "2024-06-22T11:00:00Z",
		status: "Pending",
		email: "john.doe@example.com",
		description: "Meeting about project updates",
	};

	ws.send(
		JSON.stringify({
			type: "newReservation",
			reservation: newReservation,
		})
	);

	ws.on("close", () => {
		console.log("Client disconnected");
	});
});
console.log("WebSocket server running on ws://localhost:3001");

const notifyClients = (data: any) => {
	wss.clients.forEach((client) => {
		if (client.readyState === client.OPEN) {
			client.send(JSON.stringify(data));
		}
	});
};

Reservation.watch().on(
	"change",
	(change: { operationType: string; fullDocument: { status: string } }) => {
		if (
			change.operationType === "insert" &&
			change.fullDocument.status === "Pending"
		) {
			notifyClients(change.fullDocument);
		}
	}
);

const PORT = process.env.EXPRESS_PORT || 3001;
server.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
