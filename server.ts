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

	ws.on("close", () => {
		console.log("Client disconnected");
	});
});

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
