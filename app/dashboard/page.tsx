"use client";

import React, { useEffect, useState } from "react";
import Calendar from "../../components/Calendar"; // Import Calendar component
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser } from "react-icons/fa";
import SidebarClient from "../../components/SidebarClient";
const companies = ["Flawless", "MTSI", "FINA", "Beauty and Butter"];
import { Reservation } from "../../types/type";
import { io, Socket } from "socket.io-client";

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
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [fromSelectedTime, setFromSelectedTime] = useState(new Date());
	const [toSelectedTime, setToSelectedTime] = useState(new Date());
	const [email, setEmail] = useState("");
	const [company, setCompany] = useState(companies[0]);
	const [department, setDepartment] = useState(departments[0]);
	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [showDescription, setShowDescription] = useState(false);
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const [reservations, setReservations] = useState<Reservation[]>([]);

	useEffect(() => {
		let socket: Socket;

		// Define the socket connection URL based on the environment
		const socketUrl = "https://calendar-reservation-enq3ce7zja-wl.a.run.app/";

		// Create the socket connection
		socket = io(socketUrl, {
			transports: ["websocket"],
		});

		socket.on("connect", () => {
			console.log("WebSocket connected");
		});

		socket.on("newReservation", (data: Reservation) => {
			console.log("New reservation received:", data);
			setReservations((prevReservations) => [...prevReservations, data]);
		});

		socket.on("disconnect", () => {
			console.log("WebSocket disconnected");
		});

		socket.on("error", (error: Error) => {
			console.error("WebSocket error:", error);
		});

		// Clean up WebSocket on component unmount
		return () => {
			socket.disconnect();
		};
	}, []);

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

		// Restriction for valid booking times between 8 AM and 6 PM
		const fromTimeValid =
			fromSelectedTime.getHours() >= 8 && fromSelectedTime.getHours() < 18;
		const toTimeValid =
			toSelectedTime.getHours() >= 8 && toSelectedTime.getHours() <= 18;
		if (
			!fromTimeValid ||
			!toTimeValid ||
			combinedFromDateTime >= combinedToDateTime
		) {
			toast.error(
				`${fromSelectedTime.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})} to ${toSelectedTime.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})} is not appropriate. Please check again`
			);
			return;
		}

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

		// Check if the selected time is in the past
		const currentTime = new Date();
		if (
			combinedFromDateTime < currentTime ||
			combinedToDateTime < currentTime
		) {
			toast.error(
				"You cannot reserve in the past. Please select a future time."
			);
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
				setTimeout(() => {
					window.location.reload();
				}, 5000);
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
			<SidebarClient />
			<ToastContainer autoClose={5000} />
			<div className="flex lg:pl-[400px] xl:pl-[550px] 2xl:pl-[850px] gap-2 bg-[#e81e83] lg:py-1 22xl:py-2 items-center justify-between">
				<div>
					<h1 className="lg:text-xl 2xl:text-2xl font-bold text-white">
						Welcome User
					</h1>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 mx-5 lg:px-[80px] 2xl:px-[330px] lg:w-full lg:h-[763px] lg:ml-0 2xl:w-full 2xl:ml-0 2xl:mt-0 2xl:h-[877px] 2xl:pl-14 2xl:pt-12 bg-slate-100 lg:py-6 shadow-md">
				<div className="flex flex-col items-start lg:gap-4 2xl:gap-6 px-5 lg:px-10 2xl:px-14">
					<div className="lg:-ml-10 lg:pb-5 2xl:pb-0 2xl:ml-6">
						<span className="lg:text-3xl 2xl:text-4xl tracking-wide font-black font-sans text-[#e61e84]">
							Calendar Reservation
						</span>
					</div>
					<div className="flex flex-col w-full lg:gap-3 2xl:gap-4 lg:w-[300px] 2xl:w-[600px] lg:-ml-10  2xl:ml-6">
						<div>
							<label
								className="lg:text-[18px] 2xl:text-[22px] text-[#e61e84] tracking-normal font-extrabold"
								htmlFor="email"
							>
								Email:
							</label>
							<input
								id="email"
								type="text"
								value={email}
								onChange={handleEmailChange}
								className="lg:w-[350px] 2xl:w-full lg:text-[16px] 2xl:text-[18px] lg:px-4 lg:py-1 2xl:py-2 border rounded-md"
								placeholder="example123@gmail.com"
							/>
						</div>
						<div>
							<label
								className="lg:text-[18px] 2xl:text-[22px] text-[#e61e84] tracking-normal font-extrabold"
								htmlFor="company"
							>
								Company:
							</label>
							<select
								id="company"
								value={company}
								onChange={handleCompanyChange}
								className="lg:w-[350px] 2xl:w-full lg:text-[16px] 2xl:text-[18px] lg:px-4 lg:py-1 2xl:py-2 border rounded-md"
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
								className="lg:text-[18px] 2xl:text-[22px] text-[#e61e84] tracking-normal font-extrabold"
								htmlFor="department"
							>
								Department:
							</label>
							<select
								id="department"
								value={department}
								onChange={handleDepartmentChange}
								className="lg:w-[350px] 2xl:w-full lg:text-[16px] 2xl:text-[18px] lg:px-4 lg:py-1 2xl:py-2 border rounded-md"
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
								className="lg:text-[18px] 2xl:text-[22px] text-[#e61e84] tracking-normal font-extrabold"
								htmlFor="name"
							>
								Full Name:
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={handleNameChange}
								className="lg:w-[350px] 2xl:w-full lg:text-[16px] 2xl:text-[18px] lg:px-4 lg:py-1 2xl:py-2 border rounded-md"
								placeholder="Please enter your full name"
							/>
						</div>
						<div>
							<label
								className="lg:text-[18px] 2xl:text-[22px] text-[#e61e84] tracking-normal font-extrabold"
								htmlFor="title"
							>
								Room:
							</label>
							<div className="flex gap-2 pt-2">
								<label className="text-[#e61e84] lg:text-[16px] 2xl:text-[15px]">
									<input
										type="radio"
										value="Energy"
										checked={title === "Energy"}
										onChange={handletitleChange}
										className="mr-1"
									/>
									Energy
								</label>
								<label className="text-[#e61e84] lg:text-[16px] 2xl:text-[15px]">
									<input
										type="radio"
										value="Focus"
										checked={title === "Focus"}
										onChange={handletitleChange}
										className="mr-1"
									/>
									Focus
								</label>
								<label className="text-[#e61e84] lg:text-[16px] 2xl:text-[15px]">
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
						<div>
							<label
								className="lg:text-[18px] 2xl:text-[18px] tracking-normal"
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
							<span className="lg:text-[18px] 2xl:text-[18px] ml-1">Yes</span>
						</div>
						{showDescription && (
							<div>
								<label
									className="lg:text-[18px] 2xl:text-[22px] text-[#e61e84] tracking-normal font-extrabold"
									htmlFor="description"
								>
									Urgent Notes:
								</label>
								<input
									id="description"
									type="description"
									value={description}
									onChange={handleDescriptionChange}
									className="lg:w-[350px] 2xl:w-full lg:text-[16px] 2xl:text-[18px] px-4 lg:py-1 2xl:py-2 border rounded-md"
									placeholder="Please provide the reason"
								/>
							</div>
						)}
						<form onSubmit={handleContinue}>
							<button
								type="submit"
								className="bg-[#e61e84] lg:mt-0 2xl:mt-2 hover:bg-[#3fa8ee] 2xl:text-[18px] font-extrabold text-white rounded text-[12px] w-auto p-2 uppercase"
							>
								Submit
							</button>
						</form>
					</div>
				</div>
				<div className="col-span-1 ">
					<div className="lg:-ml-28 lg:pb-5 2xl:pb-0 2xl:ml-0">
						<span className="lg:text-3xl text-[#e61e84] 2xl:text-[35px] mt-4 font-sans tracking-wide font-extrabold">
							Select Reservation Date
						</span>
					</div>
					<div className="py-5 lg:absolute lg:left-[400px] 2xl:relative 2xl:left-0">
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
					<div className="grid lg:grid-cols-2 2xl:grid-cols-2 gap-2 lg:gap-x-4 2xl:gap-x-10 font-bold lg:absolute lg:top-[700px] lg:left-[900px] 2xl:top-[795px] 2xl:left-[1300px]">
						<div className="bg-green-200 text-green-500 2xl:text-[16px] lg:text-[14px] 2xl:p-2 lg:p-1 rounded-lg">
							Available - Free to reserve
						</div>
						<div className="bg-red-200 text-red-500 2xl:text-[16px] lg:text-[14px] 2xl:p-2 lg:p-1 rounded-lg">
							Unavailable - Cannot reserve
						</div>
						<div className="bg-yellow-200 text-yellow-600 2xl:text-[16px] lg:text-[14px] 2xl:p-2 lg:p-1 rounded-lg">
							Pending - Reservation in progress
						</div>
						<div className="bg-blue-200 text-gray-600 2xl:text-[16px] lg:text-[14px] 2xl:p-2 lg:p-1 rounded-lg">
							Unavailable - Past time slot
						</div>
					</div>

					<div className="font-bold lg:absolute lg:top-[520px] lg:left-[480px] 2xl:top-[620px] 2xl:left-[820px] lg:text-[14px] 2xl:text-[16px]">
						<div className="mb-2 text-[#e61e84] lg:text-[16px] 2xl:text-[18px]">
							Legend - Color Indicator
						</div>
						<div className="flex items-center mb-4">
							<div className="bg-green-500 2xl:p-2 lg:p-1 rounded-lg mr-2"></div>
							<div>
								<p>- This date has confirmed bookings</p>
							</div>
						</div>
						<div className="flex items-center mb-4">
							<div className="bg-[#3fa8ee] 2xl:p-2 lg:p-1 rounded-lg mr-2"></div>
							<div>
								<p>- This date has both confirmed and pending bookings</p>
							</div>
						</div>
						<div className="flex items-center mb-4">
							<div className="bg-yellow-400 2xl:p-2 lg:p-1 rounded-lg mr-2"></div>
							<div>
								<p>- This date has pending bookings</p>
							</div>
						</div>
						<div className="flex items-center mb-4">
							<div className="bg-red-200 2xl:p-2 lg:p-1 rounded-lg mr-2">
								<p className="text-red-500">Fully Booked</p>
							</div>
							<div>
								<p>- No rooms available</p>
							</div>
						</div>
						<div className="flex items-center">
							<div className="bg-blue-100 2xl:p-2 lg:p-1 rounded-lg mr-2">
								<p className="text-blue-500">10</p>
							</div>
							<div>
								<p>- Present Day</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
