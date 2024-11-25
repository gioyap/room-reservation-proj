import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Function to convert UTC date to local date string
const convertUTCToLocalDate = (utcDateString: string, timeZone: string) => {
	const utcDate = new Date(utcDateString);
	return utcDate.toLocaleString("en-US", { timeZone });
};

export async function POST(request: NextRequest) {
	try {
		// Parse the request body to get the email details
		const newData = await request.json();

		// Create a transporter
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.NEXT_PUBLIC_EMAIL_USER,
				pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
			},
		});

		const descriptionContent = newData.description
			? `<p style="text-align: center; color: #e61e84; font-size: 20px;">This is from user, he/she has a concern:</p>
		   <p style="text-align: center; color: #e61e84; font-size: 18px;">"${newData.description}"</p>`
			: "";

		// Set the desired time zone
		const timeZone = "Asia/Manila";

		// Generate HTML content for the email
		const htmlContent = `
		<div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center;">
					<h1 style="color: #e61e84; font-size: 42px;">New Reservation</h1>
					<div style="display: flex; justify-content: center;">
						<table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; margin: 0 auto;">
							<thead>
								<tr style="background-color: #e61e84; color: white; font-size: 18px;">
									<th>Company</th>
									<th>Department</th>
									<th>Name</th>
									<th>Room</th>
									<th>From</th>
									<th>To</th>
								</tr>
							</thead>
							<tbody>
								<tr style="color: #e61e84; font-size: 18px;">
									<td>${newData.company}</td>
									<td>${newData.department}</td>
									<td>${newData.name}</td>
									<td>${newData.title}</td>
									<td>${convertUTCToLocalDate(newData.fromDate, timeZone)}</td>
                <td>${convertUTCToLocalDate(newData.toDate, timeZone)}</td>
								</tr>
							</tbody>
						</table>
					</div>
			${descriptionContent}
			<p style="text-align: center; color: #e61e84; font-size: 18px;">Go to the Admin Dashboard to be able to accept or deny the request. Thank you.</p>
		</div>
		`;

		// the user able to notify the admin
		const adminMailOptions = {
			from: process.env.NEXT_PUBLIC_EMAIL_USER,
			to: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
			subject: "New Reservations",
			html: htmlContent,
		};

		// Send the email
		await transporter.sendMail(adminMailOptions);

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
