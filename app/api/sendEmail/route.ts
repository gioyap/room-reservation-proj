// pages/api/sendEmail.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
	try {
		// Fetch data from the API
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/fetchData`
		);
		const newData = await response.json();

		// Create a transporter
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		// Generate HTML content for the email
		const htmlContent = `
			<h1>New Reservation Data</h1>
			<p>Here is the new reservation:</p>
			<table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
				<thead>
					<tr>
						<th>Title</th>
						<th>Start Date</th>
						<th>Duration (hours)</th>
						<th>Duration (minutes)</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>${newData.title}</td>
						<td>${new Date(newData.startDate).toLocaleString()}</td>
						<td>${newData.duration.hours}</td>
						<td>${newData.duration.minutes}</td>
					</tr>
				</tbody>
			</table>
		`;

		// Define email options
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: "yapgioedrian@gmail.com",
			subject: "Reservations Data",
			html: htmlContent,
		};

		// Send the email
		await transporter.sendMail(mailOptions);

		return NextResponse.json(
			{
				message: "Email sent successfully",
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Failed to send email", error);
		return NextResponse.json({ error: error.message }), { status: 500 };
	}
}
