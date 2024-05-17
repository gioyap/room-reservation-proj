// pages/api/sendEmail.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
	try {
		// Fetch data from the API
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/fetchData`
		);
		const data = await response.json();

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
			<h1>Reservations Data</h1>
			<p>Here are the reservations:</p>
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
					${data.reservation
						.map(
							(res: any) => `
						<tr>
							<td>${res.title}</td>
							<td>${new Date(res.startDate).toLocaleString()}</td>
							<td>${res.duration.hours}</td>
							<td>${res.duration.minutes}</td>
						</tr>
					`
						)
						.join("")}
				</tbody>
			</table>
		`;

		// Define email options
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: "yapgioedrian@gmail.com",
			subject: "Reservations Data",
			text: `Here are the reservations:\n\n${JSON.stringify(data, null, 2)}`,
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
