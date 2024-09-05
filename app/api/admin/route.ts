// route.ts
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import User from "@/utils/models/auth";
import { connect } from "../../../utils/config/database";
import { authOptions } from "@/utils/authOptions";

// POST method for changing password
export async function POST(request: NextRequest) {
	try {
		await connect();

		// Get the session
		const session = await getServerSession(authOptions);

		if (
			!session ||
			session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL
		) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { oldPassword, newPassword } = await request.json();

		if (!oldPassword || !newPassword) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const passwordsMatch = await bcrypt.compare(oldPassword, user.password);
		if (!passwordsMatch) {
			return NextResponse.json(
				{ error: "Old password is incorrect" },
				{ status: 400 }
			);
		}

		const hashedNewPassword = await bcrypt.hash(newPassword, 12);
		user.password = hashedNewPassword;
		await user.save();

		return NextResponse.json(
			{ message: "Password changed successfully" },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error changing password:", error);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
