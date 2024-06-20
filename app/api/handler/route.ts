import { NextRequest, NextResponse } from "next/server";
import { saveReservationToDatabase } from "@/utils/config/database";
import { Server as SocketServer, Socket } from "socket.io";
import http from "http";

// Define io with appropriate SocketServer type and initialize as null
let io: SocketServer<any> | null = null;

// Function to initialize Socket.io
const initSocketIO = (httpServer: http.Server) => {
	io = new SocketServer(httpServer, {
		path: "/api/socket",
	});

	io.on("connection", (socket: Socket) => {
		console.log(`Socket.io client connected: ${socket.id}`);
	});
};

// Post handler function for handling POST requests
export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		// Initialize Socket.io if not already initialized
		if (!io) {
			const httpServer = http.createServer();
			httpServer.listen(process.env.PORT || 3000);
			initSocketIO(httpServer);
		}

		// Handle only POST requests
		if (req.method !== "POST") {
			return NextResponse.json(
				{ message: "Method not allowed" },
				{ status: 405 }
			);
		}

		// Process reservation from request body
		const reservation = req.body;

		// Save reservation to database
		await saveReservationToDatabase(reservation);

		// Emit event to update reservations to connected clients
		if (io) {
			io.emit("update-reservations", reservation);
		} else {
			throw new Error("Socket.io not initialized");
		}

		// Return success response
		return NextResponse.json(
			{ message: "Reservation added", reservation },
			{ status: 201 }
		);
	} catch (error) {
		// Handle errors and return appropriate response
		console.error("Error handling request:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
