// admin-client.js (Admin WebSocket Client)

const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3001");

ws.on("open", () => {
	console.log("Connected to WebSocket server");

	ws.on("message", (data) => {
		const message = JSON.parse(data);
		if (message.type === "newReservation") {
			console.log("Received new reservation:", message.reservation);
			// Here you can update your admin application state with the new reservation data
		}
	});
});

ws.on("close", () => {
	console.log("Disconnected from WebSocket server");
});
