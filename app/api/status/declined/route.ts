import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/utils/config/database";
import Reservation from "@/utils/models/reservation";

connect();

export async function GET(request: NextRequest) {
	try {
		const reservations = await Reservation.find({ status: "Declined" });
		return NextResponse.json({ reservations }, { status: 200 });
	} catch (error: any) {
		console.error("Error fetching reservations:", error);
		return NextResponse.json(
			{ error: "Failed to fetch reservations" },
			{ status: 500 }
		);
	}
}
