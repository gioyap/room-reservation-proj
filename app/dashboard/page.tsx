// "use client";

// import { signOut, useSession } from "next-auth/react";
// import React from "react";

// const Dashboard = () => {

//   const {data:session} = useSession();

//   return (
//     <div
//       className="min-h-screen py-20"
//       style={{
//         backgroundImage: `url("/background.png")`,
//         backgroundRepeat: "no-repeat",
//         backgroundSize: "cover",
//       }}
//     >
//       <div className="w-full max-w-2xl grid place-items-center mx-auto py-40 gap-6 bg-slate-50">
//         <span className="text-4xl tracking-wide font-semibold capitalize text-[#5D7DF3]">
//           welcome to the Dashboard
//         </span>
//         {session && <span className="text-2xl tracking-normal py-10 font-semibold">{session.user?.name}</span>}

//         <button onClick={()=> signOut()} className="bg-slate-950 text-white rounded text-lg w-auto px-6 py-3 uppercase">
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

"use client";

import { signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from "date-fns";
import { enGB } from "date-fns/locale";

const Dashboard = () => {
	const { data: session } = useSession();
	const [startDate, setStartDate] = useState(new Date());
	const [title, setTitle] = useState("");
	const [duration, setDuration] = useState({ hours: "", minutes: "" });
	const [showMinutesInput, setShowMinutesInput] = useState(false);

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value);
	};

	const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setDuration((prevDuration) => ({
			...prevDuration,
			[name]: value,
		}));
	};

	const handleContinue = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Ensure all form fields are filled properly
		if (!title || !startDate || !duration.hours) {
			console.log("Please fill out all required fields.");
			return;
		}

		// Construct the reservation data object
		const reservationData = {
			title,
			startDate,
			duration: {
				hours: Number(duration.hours),
				minutes: Number(duration.minutes) || 0, // Default to 0 if minutes are not specified
			},
		};

		try {
			// Send reservation data to backend route for saving to MongoDB
			const response = await fetch("/api/reservationDB", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(reservationData),
			});

			if (response.ok) {
				console.log("Reservation saved successfully!");

				// After saving the reservation, send the email
				const emailResponse = await fetch("/api/sendEmail", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(reservationData),
				});

				if (emailResponse.ok) {
					console.log("Email sent successfully");
				} else {
					console.error("Failed to send email");
				}

				// Handle success scenario
			} else {
				console.error("Failed to save reservation:", response.statusText);
				// Handle error scenario
			}
		} catch (error) {
			console.error("Error saving reservation:", error);
			// Handle error scenario
		}

		// Log the reservation details
		console.log("Reservation Details:", reservationData);
	};

	const handleShowMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setShowMinutesInput(e.target.checked);
		// Reset minutes when hiding the input
		if (!e.target.checked) {
			setDuration((prevDuration) => ({
				...prevDuration,
				minutes: "",
			}));
		}
	};

	return (
		<div
			className="min-h-screen py-20"
			style={{
				backgroundImage: `url("/background.png")`,
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
			}}
		>
			<div className=" grid grid-col-1 col-span-1 md:grid-cols-2 mx-5 px-6 lg:w-[800px] lg:ml-28 xl:w-[1000px] xl:ml-[500px] xl:mt-[50px] xl:h-[600px] xl:pl-24 xl:pt-20 bg-slate-50 py-8 rounded-md shadow-md">
				<div className="flex flex-col items-start gap-6">
					<div className="ml-2 md:0 xl:ml-0">
						<span className="text-2xl xl:text-4xl tracking-wide font-black font-sans text-[#3fa8ee]">
							Calendar Reservation
						</span>
					</div>
					{session && (
						<div className="flex flex-col gap-4">
							<div>
								<label
									className="text-[16px] xl:text-[22px] tracking-normal font-extrabold"
									htmlFor="title"
								>
									Title:
								</label>
								<input
									id="title"
									type="text"
									value={title}
									onChange={handleTitleChange}
									className="w-full text-[14px] xl:text-[18px] px-4 py-2 border  rounded-md"
									placeholder="Enter reservation title"
								/>
							</div>
							<div>
								<label
									className="text-[16px] xl:text-[20px] tracking-normal font-extrabold"
									htmlFor="hours"
								>
									Duration (hours):
								</label>
								<input
									id="hours"
									name="hours"
									type="number"
									value={duration.hours}
									onChange={handleDurationChange}
									className="w-full text-[14px] xl:text-[18px] px-4 py-2 border rounded-md"
									placeholder="Enter duration in hours"
									min="0"
									max="24"
								/>
							</div>

							<div className="mt-2">
								<label
									className="text-[16px] xl:text-[18px] tracking-normal"
									htmlFor="showMinutes"
								>
									Include Minutes:
								</label>
								<input
									id="showMinutes"
									name="showMinutes"
									type="checkbox"
									checked={showMinutesInput}
									onChange={handleShowMinutesChange}
									className="ml-2"
								/>
								<span className="text-[16px] xl:text-[18px] ml-1">Yes</span>
							</div>

							{showMinutesInput && (
								<div>
									<label
										className="text-[16px] font-extrabold tracking-normal py-2"
										htmlFor="minutes"
									>
										Duration (minutes):
									</label>
									<input
										id="minutes"
										name="minutes"
										type="number"
										value={duration.minutes}
										onChange={handleDurationChange}
										className="w-full text-[14px] px-4 py-2 border rounded-md"
										placeholder="Enter duration in minutes"
										min="0"
										max="59"
									/>
								</div>
							)}
						</div>
					)}
					<button
						onClick={() => signOut()}
						className="bg-[#3fa8ee] hover:bg-[#ff6f00] text-white rounded text-[12px] xl:text-[18px] w-auto p-2 uppercase font-extrabold"
					>
						Logout
					</button>
				</div>
				<div className=" col-span-1">
					<div className="ml-2">
						<span className="text-[22px] text-[#3fa8ee] xl:text-[35px] mt-4 font-sans tracking-wide font-extrabold">
							Select Reservation Date
						</span>
					</div>
					<DatePicker
						id="startDate"
						selected={startDate}
						onChange={(date) => setStartDate(date ?? new Date())}
						minDate={new Date()}
						maxDate={addDays(new Date(), 30)}
						showTimeSelect
						timeFormat="HH:mm"
						timeIntervals={15}
						timeCaption="time"
						dateFormat="MMMM d, yyyy h:mm aa"
						className="w-full my-4 px-4 py-2 border rounded-md"
						calendarStartDay={1}
						locale={enGB}
						// timeZone="Asia/Manila"
					/>
					<form onSubmit={handleContinue}>
						{/* Your form inputs and button here */}
						<button
							type="submit"
							className="bg-[#3fa8ee] mt-2 hover:bg-[#ff6f00] xl:text-[18px] font-extrabold text-white rounded text-[12px] w-auto p-2 uppercase"
						>
							Continue
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
