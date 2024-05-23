"use client";

import { signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import Calendar from "@/components/Calendar"; // Import Calendar component
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
	const { data: session } = useSession();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [selectedTime, setSelectedTime] = useState(new Date());
	const [department, setDepartment] = useState("");
	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [duration, setDuration] = useState({ hours: "", minutes: "" });
	const [showMinutesInput, setShowMinutesInput] = useState(false);

	const handleDepartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDepartment(e.target.value);
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
	};

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

	const formattedSelectedTime = selectedTime.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
		timeZone: "Asia/Manila",
	});

	const handleContinue = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Ensure all form fields are filled properly
		if (
			!department ||
			!name ||
			!title ||
			!selectedDate ||
			!selectedTime ||
			!duration.hours
		) {
			toast.error("Please fill out all required fields.");
			return;
		}
		const combinedDateTime = new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth(),
			selectedDate.getDate(),
			selectedTime.getHours(),
			selectedTime.getMinutes(),
			selectedTime.getSeconds()
		);
		// Construct the reservation data object
		const reservationData = {
			department,
			name,
			title,
			startDate: combinedDateTime, // Use selectedDate instead of startDate
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
				toast.success("Reservation saved successfully!");

				// After saving the reservation, send the email
				const emailResponse = await fetch("/api/sendEmail", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(reservationData),
				});

				if (emailResponse.ok) {
					toast.success("Email sent successfully");
				} else {
					toast.error("Failed to send email");
				}

				// Handle success scenario
			} else {
				toast.error("Failed to save reservation: " + response.statusText);
				// Handle error scenario
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error("Error saving reservation: " + error.message);
			} else {
				toast.error("An unknown error occurred");
			}
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
		<div className="min-h-screen py-0">
			<ToastContainer />
			{session && (
				<div className="flex flex-col gap-2 bg-[#e61e84] py-2 items-center">
					<h1 className="text-2xl font-bold text-white mb-2">
						Welcome {session.user?.name}
					</h1>
				</div>
			)}
			<div className="grid grid-col-1 col-span-1 md:grid-cols-2 mx-5 px-6 lg:w-full lg:h-[750px] lg:ml-0 xl:w-full xl:ml-0 xl:mt-0 xl:h-[860px] xl:pl-24 xl:pt-16 bg-slate-100 py-8 rounded-md shadow-md">
				<div className="flex flex-col items-start gap-6">
					<div className="ml-2 md:0 xl:ml-0">
						<span className="text-2xl xl:text-4xl tracking-wide font-black font-sans text-[#e61e84]">
							Calendar Reservation
						</span>
					</div>
					{session && (
						<div className="flex flex-col w-[400px] xl:w-[600px] gap-4">
							<div>
								<label
									className="text-[16px] xl:text-[22px] text-[#e61e84] tracking-normal font-extrabold"
									htmlFor="department"
								>
									Department:
								</label>
								<input
									id="department"
									type="text"
									value={department}
									onChange={handleDepartmentChange}
									className="w-full text-[14px] xl:text-[18px] px-4 py-2 border rounded-md"
									placeholder="Enter your Department"
								/>
							</div>
							<div>
								<label
									className="text-[16px] xl:text-[22px] text-[#e61e84] tracking-normal font-extrabold"
									htmlFor="name"
								>
									Full Name:
								</label>
								<input
									id="name"
									type="text"
									value={name}
									onChange={handleNameChange}
									className="w-full text-[14px] xl:text-[18px] px-4 py-2 border rounded-md"
									placeholder="Please enter your full name"
								/>
							</div>
							<div>
								<label
									className="text-[16px] xl:text-[22px] text-[#e61e84] tracking-normal font-extrabold"
									htmlFor="title"
								>
									Room:
								</label>
								<input
									id="title"
									type="text"
									value={title}
									onChange={handleTitleChange}
									className="w-full text-[14px] xl:text-[18px] px-4 py-2 border rounded-md"
									placeholder="Enter reservation title"
								/>
							</div>
							<div>
								<label
									className="text-[16px] xl:text-[20px] text-[#e61e84] tracking-normal font-extrabold"
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
										className="text-[16px] xl:text-[20px] font-extrabold text-[#e61e84] tracking-normal py-2"
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
										className="w-full text-[14px] xl:text-[18px] px-4 py-2 border rounded-md"
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
						className="bg-[#e61e84] hover:bg-[#3fa8ee] text-white rounded text-[12px] xl:text-[18px] w-auto p-2 uppercase font-extrabold"
					>
						Logout
					</button>
				</div>
				<div className="col-span-1">
					<div className="ml-2">
						<span className="text-[22px] text-[#e61e84] xl:text-[35px] mt-4 font-sans tracking-wide font-extrabold">
							Select Reservation Date
						</span>
					</div>
					<div className="py-5">
						<Calendar
							selectedDate={selectedDate}
							onChange={setSelectedDate}
							selectedTime={selectedTime}
							onTimeChange={setSelectedTime}
						/>
					</div>
					{/* Selected date and time display */}
					<div className="mt-4">
						<p className="text-lg font-semibold text-[#e61e84]">
							Selected Date:
						</p>
						<p>{selectedDate.toDateString()}</p>
					</div>
					<div className="mt-4 pb-6">
						<p className="text-lg font-semibold text-[#e61e84]">
							Selected Time:
						</p>
						<p>{formattedSelectedTime}</p>
					</div>
					<form onSubmit={handleContinue}>
						{/* Your form inputs and button here */}
						<button
							type="submit"
							className="bg-[#e61e84] mt-2 hover:bg-[#3fa8ee] xl:text-[18px] font-extrabold text-white rounded text-[12px] w-auto p-2 uppercase"
						>
							Submit
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
