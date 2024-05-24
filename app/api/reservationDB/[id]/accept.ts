// pages/api/reservationDB/[id]/accept.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "@/utils/config/database";
import { ObjectId } from "mongodb";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === "PUT") {
		const { id } = req.query;

		// Convert id to ObjectId
		const objectId = new ObjectId(id as string);

		try {
			const { db } = await connect();
			const result = await db
				.collection("reservations")
				.updateOne({ _id: objectId }, { $set: { status } });
			res.status(200).json(result);
		} catch (error) {
			console.error("Error updating reservation status:", error);
			res.status(500).json({ error: "Failed to update reservation status" });
		}
	} else {
		res.setHeader("Allow", ["PUT"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
};
