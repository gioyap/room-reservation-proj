// app/api/reservationDB/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/utils/config/database";
import Reservation from "@/utils/models/reservation";

connect();

export async function GET(request: NextRequest) {
	try {
		// Fetch reservation data from the database
		const reservations = await Reservation.find();
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

		// Ensure the startDate is in the correct format
		const formattedStartDate = new Date(fromDate).toISOString();
		const formattedToDate = new Date(toDate).toISOString();

		const newReservation = new Reservation({
			email,
			company,
			department,
			name,
			title,
			fromDate: formattedStartDate,
			toDate: formattedToDate,
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
// this put logic is for the admin able to click the accept and decline button
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
