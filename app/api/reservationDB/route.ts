// app/api/reservationDB/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/utils/config/database";
import Reservation from "@/utils/models/reservation";

connect();

export async function GET(request: NextRequest) {
	try {
		// Fetch reservation data from the database
		const reservations = await Reservation.find();

		// Return the fetched reservation data in the response
		return NextResponse.json({ reservations }, { status: 200 });
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
		const { department, name, title, startDate, duration } =
			await request.json();

		if (
			!department ||
			!name ||
			!title ||
			!startDate ||
			!duration ||
			!duration.hours
		) {
			return NextResponse.json(
				{
					error: "Missing required fields: title, startDate, or duration.hours",
				},
				{ status: 400 }
			);
		}

		// Ensure the startDate is in the correct format
		const formattedStartDate = new Date(startDate);

		const newReservation = new Reservation({
			department,
			name,
			title,
			startDate: formattedStartDate,
			duration,
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

export async function PUT(request: NextRequest) {
	try {
		// const id = request.url.split("/").pop(); // Extract ID from URL
		// const { status } = await request.json();
		const { id, status } = await request.json();

		if (!id || !status) {
			return NextResponse.json(
				{ error: "Missing required fields: id or status" },
				{ status: 400 }
			);
		}

		// Update the status of the reservation in the database
		const updatedReservation = await Reservation.findByIdAndUpdate(
			id,
			{ status },
			{ new: true } // Return the updated document
		);

		if (!updatedReservation) {
			return NextResponse.json(
				{ error: "Reservation not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{
				message: "Reservation status updated successfully!",
				reservation: updatedReservation,
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error updating reservation status:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
