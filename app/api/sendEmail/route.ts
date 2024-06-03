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

		const descriptionContent = newData.description
			? `<p>This is from user, he/she have a concern:</p>
			<p>"${newData.description}"</p>`
			: "";

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
						<th>From</th>
						<th>To</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>${newData.department}</td>
						<td>${newData.name}</td>
						<td>${newData.title}</td>
						<td>${new Date(newData.fromDate).toLocaleString()}</td>
						<td>${new Date(newData.toDate).toLocaleString()}</td>
					</tr>
				</tbody>
			</table>
			${descriptionContent}
			<p>This is new reservation, please let me know if this is accepted or decline</p>
			<p>Go to the Admin Dashboard to able to accepted or deny the request. Thank you</p>
		`;

		// the user able to notify the admin
		const adminMailOptions = {
			from: process.env.NEXT_PUBLIC_EMAIL_USER,
			to: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
			subject: "New Reservations",
			html: htmlContent,
		};

		// the admin able to notify the user
		const userMailOption = {
			from: process.env.NEXT_PUBLIC_EMAIL_USER,
			to: newData.email,
			subject: newData.subject,
			text: newData.message,
		};

		// Send the email
		await transporter.sendMail(adminMailOptions);
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
