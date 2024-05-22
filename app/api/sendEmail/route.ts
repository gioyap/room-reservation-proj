// pages/api/sendEmail.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
	try {
		// Parse the request body to get the new reservation data
		const newData = await request.json();

		// Log the newData to check its structure
		console.log("New Data:", newData);

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
			<h1>New Reservation</h1>
			<p>Here is the new reservation:</p>
			<table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
				<thead>
					<tr>
						<th>Department</th>
						<th>Name</th>
						<th>Room</th>
						<th>Start Date</th>
						<th>Duration (hours)</th>
						<th>Duration (minutes)</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>${newData.department}</td>
						<td>${newData.name}</td>
						<td>${newData.title}</td>
						<td>${new Date(newData.startDate).toLocaleString()}</td>
						<td>${newData.duration.hours}</td>
						<td>${newData.duration.minutes}</td>
					</tr>
				</tbody>
			</table>
			<p>This is new reservation, please let me know if this is accepted or decline</p>
			<p>Go to the Admin Dashboard to able to accepted or deny the request. Thank you</p>
		`;

		// Define email options
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: process.env.ADMIN_EMAIL,
			subject: "New Reservations",
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
