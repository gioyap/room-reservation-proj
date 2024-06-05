"use client";

import { signOut, useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import Calendar from "@/components/Calendar"; // Import Calendar component
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser } from "react-icons/fa";
const companies = ["Flawless", "MTSI", "FINA", "Beauty and Butter"];

const departments = [
	"Executives",
	"MIS",
	"Accounting",
	"SCM",
	"Procurement",
	"MART",
	"HR",
	"CMRT",
	"Sales",
	"Operations",
	"Audit",
];

const sortedDepartments = departments.sort((a, b) => a.localeCompare(b));

const Dashboard = () => {
	const { data: session } = useSession();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [fromSelectedTime, setFromSelectedTime] = useState(new Date());
	const [toSelectedTime, setToSelectedTime] = useState(new Date());
	const [email, setEmail] = useState("");
	const [company, setCompany] = useState(companies[0]);
	const [department, setDepartment] = useState(departments[0]);
	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [reservations, setReservations] = useState<[]>([]);
	const [showDescription, setShowDescription] = useState(false);
	const [dropdownVisible, setDropdownVisible] = useState(false);

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCompany(e.target.value);
	};

	const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setDepartment(e.target.value);
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
	};

	const handletitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value);
	};

	const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDescription(e.target.value);
	};

	const handleShowDescriptionChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setShowDescription(e.target.checked);
	};

	//just to get the data of reservation details
	useEffect(() => {
		const fetchReservations = async () => {
			try {
				const response = await fetch("/api/reservationDB");
				if (response.ok) {
					const data = await response.json();
					setReservations(data.reservations);
				} else {
					toast.error("Failed to fetch reservations");
				}
			} catch (error) {
				toast.error("An error occurred while fetching reservations");
			}
		};

		fetchReservations();
	}, []);

	const formattedSelectedTime = fromSelectedTime.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
		timeZone: "Asia/Manila",
	});

	const formattedToSelectedTime = toSelectedTime.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
		timeZone: "Asia/Manila",
	});

	const handleContinue = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (
			!email ||
			!department ||
			!name ||
			!title ||
			!selectedDate ||
			!fromSelectedTime ||
			!toSelectedTime
		) {
			toast.error("Please fill out all required fields.");
			return;
		}

		const combinedFromDateTime = new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth(),
			selectedDate.getDate(),
			fromSelectedTime.getHours(),
			fromSelectedTime.getMinutes(),
			fromSelectedTime.getSeconds()
		);

		const combinedToDateTime = new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth(),
			selectedDate.getDate(),
			toSelectedTime.getHours(),
			toSelectedTime.getMinutes(),
			toSelectedTime.getSeconds()
		);

		// Check if the selected date and time conflict with existing reservations
		const conflict = reservations.some((reservation: any) => {
			const resStartDate = new Date(reservation.fromDate);
			const resEndDate = new Date(reservation.toDate);

			// Check if the selected date conflicts with existing reservation dates
			const dateConflict =
				selectedDate.getTime() >= resStartDate.getTime() &&
				selectedDate.getTime() <= resEndDate.getTime();

			// Check if the selected time conflicts with existing reservation times
			const timeConflict =
				(combinedFromDateTime.getTime() >= resStartDate.getTime() &&
					combinedFromDateTime.getTime() < resEndDate.getTime()) ||
				(combinedToDateTime.getTime() > resStartDate.getTime() &&
					combinedToDateTime.getTime() <= resEndDate.getTime()) ||
				(combinedFromDateTime.getTime() <= resStartDate.getTime() &&
					combinedToDateTime.getTime() >= resEndDate.getTime());

			// Check if the selected room is already reserved for the same date and time
			// So the user suppose to find another available room
			const roomConflict =
				reservation.title === title &&
				dateConflict &&
				timeConflict &&
				reservation.status === "Accepted";

			return roomConflict;
		});

		if (conflict) {
			toast.error(
				"The selected room is already reserved. Please choose another room or select a different date and time."
			);
			return;
		}

		// Check if the selected date and time are within working hours (8:00 AM - 6:00 PM)
		if (
			combinedFromDateTime.getHours() < 8 ||
			combinedFromDateTime.getHours() >= 18 ||
			(combinedToDateTime.getHours() === 18 &&
				combinedToDateTime.getMinutes() > 0) || // After 6:00 PM
			combinedToDateTime.getHours() > 18
		) {
			toast.error("Reservation can only be made between 8:00 AM and 6:00 PM.");
			return;
		}

		// Check if the selected date and time are not on weekends (Saturday or Sunday)
		if (
			selectedDate.getDay() === 0 || // Sunday
			selectedDate.getDay() === 6 // Saturday
		) {
			toast.error("Reservation is not available on weekends.");
			return;
		}

		// Check if the selected date is in the past
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0); // Set current time to midnight
		if (selectedDate.getTime() < currentDate.getTime()) {
			toast.error("Reservation date cannot be in the past.");
			return;
		}

		const reservationData = {
			email,
			company,
			department,
			name,
			title,
			fromDate: combinedFromDateTime,
			toDate: combinedToDateTime,
			description,
		};
		//get the reservation data then the system will send it to the admin email
		try {
			const response = await fetch("/api/reservationDB", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(reservationData),
			});

			if (response.ok) {
				toast.success("Reservation saved successfully!");

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
			} else {
				toast.error("Failed to save reservation: " + response.statusText);
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error("Error saving reservation: " + error.message);
			} else {
				toast.error("An unknown error occurred");
			}
		}

		console.log("Reservation Details:", reservationData);
	};

	return (
		<div className="min-h-screen py-0">
			<ToastContainer autoClose={5000} />
			{session && (
				<div className="flex pl-[850px] gap-2 bg-[#e61e84] py-2 items-center justify-between relative">
					<div>
						<h1 className="text-2xl font-bold text-white mb-2">
							Welcome, {session.user?.name}
						</h1>
					</div>
					<div className="relative mr-4">
						<div className="rounded-full bg-white p-2">
							<FaUser
								className="text-[#e61e84] text-2xl cursor-pointer"
								onClick={() => setDropdownVisible(!dropdownVisible)}
							/>
						</div>
						{dropdownVisible && (
							<div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg">
								<button
									onClick={() => signOut()}
									className="w-full px-4 py-2 text-left text-black hover:bg-gray-200"
								>
									Logout
								</button>
							</div>
						)}
					</div>
				</div>
			)}
			<div className="grid grid-col-1 col-span-1 md:grid-cols-2 mx-5 px-[330px] lg:w-full lg:h-[750px] lg:ml-0 xl:w-full xl:ml-0 xl:mt-0 xl:h-[860px] xl:pl-14 xl:pt-16 bg-slate-100 py-8 rounded-md shadow-md">
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
									htmlFor="email"
								>
									Email:
								</label>
								<input
									id="email"
									type="text"
									value={email}
									onChange={handleEmailChange}
									className="w-full text-[14px] xl:text-[18px] px-4 py-2 border rounded-md"
									placeholder="example123@gmail.com"
								/>
							</div>
							<div>
								<label
									className="text-[16px] xl:text-[22px] text-[#e61e84] tracking-normal font-extrabold"
									htmlFor="company"
								>
									Company:
								</label>
								<select
									id="company"
									value={company}
									onChange={handleCompanyChange}
									className="w-full text-[14px] xl:text-[18px] px-4 py-2 border rounded-md"
								>
									{companies.map((comp) => (
										<option key={comp} value={comp}>
											{comp}
										</option>
									))}
								</select>
							</div>
							<div>
								<label
									className="text-[16px] xl:text-[22px] text-[#e61e84] tracking-normal font-extrabold"
									htmlFor="department"
								>
									Department:
								</label>
								<select
									id="department"
									value={department}
									onChange={handleDepartmentChange}
									className="w-full text-[14px] xl:text-[18px] px-4 py-2 border rounded-md"
								>
									{sortedDepartments.map((dept) => (
										<option key={dept} value={dept}>
											{dept}
										</option>
									))}
								</select>
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
								<div className="flex gap-2 pt-2">
									<label className="text-[#e61e84]">
										<input
											type="radio"
											value="Energy"
											checked={title === "Energy"}
											onChange={handletitleChange}
											className="mr-1"
										/>
										Energy
									</label>
									<label className="text-[#e61e84]">
										<input
											type="radio"
											value="Focus"
											checked={title === "Focus"}
											onChange={handletitleChange}
											className="mr-1"
										/>
										Focus
									</label>
									<label className="text-[#e61e84]">
										<input
											type="radio"
											value="Lecture"
											checked={title === "Lecture"}
											onChange={handletitleChange}
											className="mr-1"
										/>
										Lecture
									</label>
								</div>
							</div>

							<div className="mt-2">
								<label
									className="text-[16px] xl:text-[18px] tracking-normal"
									htmlFor="showDescription"
								>
									Is this urgent?
								</label>
								<input
									id="showDescription"
									name="showDescription"
									type="checkbox"
									checked={showDescription}
									onChange={handleShowDescriptionChange}
									className="ml-2"
								/>
								<span className="text-[16px] xl:text-[18px] ml-1">Yes</span>
							</div>

							{showDescription && (
								<div>
									<label
										className="text-[16px] xl:text-[22px] text-[#e61e84] tracking-normal font-extrabold"
										htmlFor="description"
									>
										Urgent Notes:
									</label>
									<input
										id="description"
										type="description"
										value={description}
										onChange={handleDescriptionChange}
										className="w-full text-[14px] xl:text-[18px] px-4 py-2 border rounded-md"
										placeholder="Please provide the reason"
									/>
								</div>
							)}
						</div>
					)}
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
							selectedTime={fromSelectedTime}
							onTimeChange={setFromSelectedTime}
							toSelectedTime={toSelectedTime}
							onToTimeChange={setToSelectedTime}
							reservations={reservations}
						/>
					</div>
					{/* reflected data */}
					<div className="absolute top-[655px]">
						<div className="mt-0">
							<p className="text-lg font-semibold text-[#e61e84]">
								Selected Date:
							</p>
							<p>{selectedDate.toDateString()}</p>
						</div>
						<div className="mt-1 pb-2">
							<p className="text-lg font-semibold text-[#e61e84]">From:</p>
							<p>{formattedSelectedTime}</p>
						</div>
						<div className="mt-1 pb-2">
							<p className="text-lg font-semibold text-[#e61e84]">To:</p>
							<p>{formattedToSelectedTime}</p>
						</div>
						<form onSubmit={handleContinue}>
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
		</div>
	);
};

export default Dashboard;
