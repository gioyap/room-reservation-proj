import express from "express";
import { createServer } from "http";
import { connect } from "./utils/config/database.js";
import Reservation from "./utils/models/reservation.js"; // Assuming Reservation model definition

const app = express();
const httpServer = createServer(app);
connect();

app.use(express.json()); // Middleware to parse JSON body

// Endpoint to handle user booking and create pending reservation
app.post("/api/reservationDB", async (req: any, res: any) => {
	try {
		const {
			company,
			department,
			name,
			title,
			fromDate,
			toDate,
			email,
			description,
			status, // Added status field to determine pending/accepted/declined
		} = req.body;

		// Create a new reservation with the specified status
		const newReservation = new Reservation({
			company,
			department,
			name,
			title,
			fromDate,
			toDate,
			status, // Use the provided status (Pending, Accepted, Declined)
			email,
			description,
		});

		await newReservation.save();

		res.status(201).json({ message: "Reservation created successfully" });
	} catch (error) {
		console.error("Error creating reservation:", error);
		res.status(500).json({ error: "Failed to create reservation" });
	}
});

// Endpoint to fetch reservations by status
app.get("/api/status/:status", async (req: any, res: any) => {
	const { status } = req.params;

	try {
		const reservations = await Reservation.find({ status }).lean();
		res.status(200).json({ reservations });
	} catch (error) {
		console.error(`Error fetching ${status} reservations:`, error);
		res.status(500).json({ error: `Failed to fetch ${status} reservations` });
	}
});

const PORT = process.env.EXPRESS_PORT || 3001;
httpServer.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
