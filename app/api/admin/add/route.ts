import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/utils/models/auth";
import { connect } from "../../../../utils/config/database";

// POST method for creating a new admin user
export async function POST(request: NextRequest) {
	try {
		await connect();

		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required." },
				{ status: 400 }
			);
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return NextResponse.json(
				{ error: "User with this email already exists." },
				{ status: 400 }
			);
		}

		// Hash the password before saving
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create new user
		const newUser = new User({
			name: "admin", // You can modify this to accept a name from request
			email,
			password: hashedPassword,
			confirmPassword: hashedPassword, // You can remove this if unnecessary
		});

		await newUser.save();

		return NextResponse.json(
			{ message: "Admin user created successfully!" },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// GET method for fetching user data
export async function GET(request: NextRequest) {
	try {
		await connect();

		const users = await User.find({}, { password: 0, confirmPassword: 0 }); // Exclude password fields for security

		if (!users) {
			return NextResponse.json({ error: "No users found" }, { status: 404 });
		}

		return NextResponse.json({ users }, { status: 200 });
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
