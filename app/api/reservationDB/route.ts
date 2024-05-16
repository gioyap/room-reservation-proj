// app/api/reservationDB/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/utils/config/database";
import Reservation from "@/utils/models/reservation";

connect();

export async function POST(request: NextRequest) {
	try {
		const { title, startDate, duration } = await request.json();

		if (!title || !startDate || !duration || !duration.hours) {
			return NextResponse.json(
				{
					error: "Missing required fields: title, startDate, or duration.hours",
				},
				{ status: 400 }
			);
		}

		const newReservation = new Reservation({
			title,
			startDate,
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
