// Import necessary modules
import express from "express";
import { createServer } from "http";
import { connect } from "./utils/config/database.js";
import cors from "cors";
import Reservation from "./utils/models/reservation.js";

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Connect to your database (assuming this is where you connect)
connect();

const corsOptions = {
	origin: "http://localhost:3000", // Adjust to your frontend URL
	methods: ["GET", "POST", "PUT", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Example function to fetch reservations from a database
const fetchReservations = async () => {
	try {
		const reservations = await Reservation.find({ status: "Pending" }).lean(); // Example query, adjust as per your schema
		return reservations;
	} catch (error) {
		console.error("Error fetching reservations:", error);
		return [];
	}
};

// Endpoint for polling data
app.get("/api/status/pending", async (req: any, res: any) => {
	try {
		const reservations = await fetchReservations();
		res.status(200).json({ reservations });
	} catch (error) {
		console.error("Error fetching pending reservations:", error);
		res.status(500).json({ error: "Failed to fetch pending reservations" });
	}
});

// Define port and start the server
const PORT = process.env.EXPRESS_PORT || 3001;
httpServer.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
