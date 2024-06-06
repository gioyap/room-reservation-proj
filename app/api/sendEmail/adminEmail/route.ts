// pages/api/sendEmail.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
	try {
		// // Log the newData to check its structure
		// console.log("New Data:", newData);

		// Parse the request body to get the email details
		const newData = await request.json();

		// Log the email details to check its structure
		// console.log("Email details:", newData);

		// Create a transporter
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.NEXT_PUBLIC_EMAIL_USER,
				pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
			},
		});

		// the admin able to notify the user
		const userMailOption = {
			from: process.env.NEXT_PUBLIC_EMAIL_USER,
			to: newData.email,
			subject: newData.subject,
			text: newData.message,
		};

		// Send the email
		await transporter.sendMail(userMailOption);

		return NextResponse.json(
			{
				message: "Email sent successfully",
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Failed to send email", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
