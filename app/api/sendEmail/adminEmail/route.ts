import { NextRequest, NextResponse } from "next/server";
import * as nodemailer from "nodemailer";

// Function to convert UTC date to local date string
const convertUTCToLocalDate = (utcDateString: string, timeZone: string) => {
	const utcDate = new Date(utcDateString);
	return utcDate.toLocaleString("en-US", { timeZone });
};

export async function POST(request: NextRequest) {
	try {
		// Parse the request body to get the email details
		const newData = await request.json();

		// Destructure the necessary details from newData
		const { email, subject, updatedReservation, status } = newData;

		if (!email || !subject || !updatedReservation || !status) {
			throw new Error("Missing required fields in the request body");
		}

		// Create a transporter
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.NEXT_PUBLIC_EMAIL_USER,
				pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
			},
		});

		// Set the desired time zone
		const timeZone = "Asia/Manila";

		let htmlMessage;
		if (status === "Accepted") {
			htmlMessage = `
				<div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center;">
					<h1 style="color: #4cbb17; font-size: 42px;">Reservation Accepted</h1>
					<p style="color: #4cbb17; font-size: 20px;">Your reservation has been accepted.</p>
					<div style="display: flex; justify-content: center;">
						<table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; margin: 0 auto;">
							<thead>
								<tr style="background-color: #4cbb17; color: white; font-size: 18px;">
									<th>Company</th>
									<th>Department</th>
									<th>Name</th>
									<th>Room</th>
									<th>From</th>
									<th>To</th>
									<th>Processed By</th>
								</tr>
							</thead>
							<tbody>
								<tr style="color: #4cbb17; font-size: 18px;">
									<td>${updatedReservation.company}</td>
									<td>${updatedReservation.department}</td>
									<td>${updatedReservation.name}</td>
									<td>${updatedReservation.title}</td>
									<td>${convertUTCToLocalDate(updatedReservation.fromDate, timeZone)}</td>
                <td>${convertUTCToLocalDate(
									updatedReservation.toDate,
									timeZone
								)}</td>
									<td>${updatedReservation.processedBy}</td>
								</tr>
							</tbody>
						</table>
					</div>
					<p style="color: #4cbb17; font-size: 18px;">Thank you for using our service.</p>
				</div>
			`;
		} else if (status === "Declined") {
			htmlMessage = `
				<div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center;">
					<h1 style="color: #ff0000; font-size: 42px;">Reservation Declined</h1>
					<p style="color: #ff0000; font-size: 20px;">Your reservation has been declined.</p>
					<div style="display: flex; justify-content: center;">
						<table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; margin: 0 auto;">
							<thead>
								<tr style="background-color: #ff0000; color: white; font-size: 18px;">
									<th>Department</th>
									<th>Name</th>
									<th>Room</th>
									<th>From</th>
									<th>To</th>
									<th>Processed By</th>
								</tr>
							</thead>
							<tbody>
								<tr style="color: #ff0000; font-size: 18px;">
									<td>${updatedReservation.department}</td>
									<td>${updatedReservation.name}</td>
									<td>${updatedReservation.title}</td>
									<td>${convertUTCToLocalDate(updatedReservation.fromDate, timeZone)}</td>
                <td>${convertUTCToLocalDate(
									updatedReservation.toDate,
									timeZone
								)}</td>
									<td>${updatedReservation.processedBy}</td>
								</tr>
							</tbody>
						</table>
					</div>
					<p style="color: #ff0000; font-size: 18px;">Thank you for using our service.</p>
				</div>
			`;
		}

		// the admin able to notify the user
		const userMailOption = {
			from: process.env.NEXT_PUBLIC_EMAIL_USER,
			to: email,
			subject: subject,
			html: htmlMessage,
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
