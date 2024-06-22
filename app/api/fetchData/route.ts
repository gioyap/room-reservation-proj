// pages/api/fetchData.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "../../../utils/config/database";
import Reservation from "../../../utils/models/reservation";

export async function GET(req: NextRequest) {
	{
		try {
			await connect();
			const reservations = await Reservation.find({}).maxTimeMS(30000); // Example: Set timeout to 30 seconds
			return NextResponse.json(
				{
					reservation: reservations,
				},
				{ status: 200 }
			);
		} catch (error: any) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
	}
}
