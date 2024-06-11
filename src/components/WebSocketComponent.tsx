// src/components/WebSocketComponent.tsx
import React, { useEffect } from "react";
import io from "socket.io-client";

const WebSocketComponent: React.FC = () => {
	useEffect(() => {
		const socket = io("http://localhost:4000");

		socket.on("connect", () => {
			console.log("Connected to WebSocket server");

			// Test sending a message
			socket.emit("reservationUpdated", { message: "Test reservation update" });
		});

		socket.on("reservationUpdate", (data: any) => {
			console.log("Received reservation update:", data);
		});

		socket.on("disconnect", () => {
			console.log("Disconnected from WebSocket server");
		});

		// Cleanup on unmount
		return () => {
			socket.disconnect();
		};
	}, []);

	return (
		<div>
			<h1>WebSocket Test</h1>
		</div>
	);
};

export default WebSocketComponent;
