// route.ts
import { NextResponse, NextRequest } from "next/server";
import Reservation from "../../../utils/models/reservation";
import { connect } from "../../../utils/config/database";

// Function to convert UTC date to local date string
const convertUTCToLocalDate = (utcDateString: string, timeZone: string) => {
	const utcDate = new Date(utcDateString);
	return utcDate.toLocaleString("en-US", { timeZone });
};

export async function GET(request: NextRequest) {
	try {
		connect();
		// Fetch reservation data from the database
		const reservations = await Reservation.find({}); // Example: Set timeout to 30 seconds

		// Convert UTC dates to local dates
		const timeZone = "Asia/Manila"; // Set the desired time zone
		const convertedReservations = reservations.map((reservation) => ({
			...reservation.toObject(),
			fromDate: convertUTCToLocalDate(reservation.fromDate, timeZone),
			toDate: convertUTCToLocalDate(reservation.toDate, timeZone),
		}));

		return NextResponse.json(
			{ reservations: convertedReservations },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error fetching reservations:", error);
		return NextResponse.json(
			{ error: "Failed to fetch reservations" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		await connect();
		const {
			email,
			company,
			department,
			name,
			title,
			fromDate,
			toDate,
			description,
		} = await request.json();

		if (
			!email ||
			!company ||
			!department ||
			!name ||
			!title ||
			!fromDate ||
			!toDate
		) {
			return NextResponse.json(
				{
					error: "Missing required fields",
				},
				{ status: 400 }
			);
		}

		// Use UTC methods to get UTC values
		const utcStartDate = new Date(fromDate).toISOString();
		const utcToDate = new Date(toDate).toISOString();

		const newReservation = new Reservation({
			email,
			company,
			department,
			name,
			title,
			fromDate: utcStartDate,
			toDate: utcToDate,
			description: description || "",
		});

		await newReservation.save();

		return NextResponse.json(
			{
				message: "Reservation saved successfully!",
				reservation: newReservation,
			},
			{ status: 201 }
		);
	} catch (error: any) {
		console.error("Error saving reservation:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// PUT method for updating reservation status
export async function PUT(request: NextRequest) {
	try {
		await connect();
		const { id, status, processedBy } = await request.json();

		if (!id || !status) {
			return NextResponse.json(
				{ error: "Missing required fields: id or status" },
				{ status: 400 }
			);
		}

		// Update the status of the reservation in the database
		const updatedReservation = await Reservation.findByIdAndUpdate(
			id,
			{ status, processedBy },
			{ new: true } // Return the updated document
		);

		if (!updatedReservation) {
			return NextResponse.json(
				{ error: "Reservation not found" },
				{ status: 404 }
			);
		}

		// Fetch the user's email from the reservation
		const { email } = updatedReservation;

		return NextResponse.json(
			{
				message: "Reservation status updated successfully!",
				reservation: updatedReservation,
				email,
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error updating reservation status:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
