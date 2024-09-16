"use client";

import React, { useState } from "react";
import Calendar from "../../components/Calendar"; // Import Calendar component
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const companies = [
	"Flawless",
	"Mixexpert Trading Services Incorporated",
	"FINA",
	"Beauty and Butter",
];
import { Reservation } from "../../types/type";
import ConfirmationModal from "../../components/ConfirmationModal";

const departments = [
	"Executive",
	"MIS-IT",
	"Accounting",
	"SCM",
	"Procurement",
	"MARTD",
	"HR",
	"CRMT",
	"Sales",
	"Operations",
	"Audit",
	"Marketing",
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
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);

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

	const checkAvailability = async (
		fromDateTime: Date,
		toDateTime: Date,
		title: string
	) => {
		try {
			const response = await fetch(`/api/reservationDB`);

			if (!response.ok) {
				throw new Error("Failed to fetch reservations");
			}

			const data = await response.json();
			const reservations = data.reservations || [];

			// Check if there is any reservation that overlaps with the desired time and title
			const isAvailable = !reservations.some(
				(reservation: any) =>
					reservation.title === title &&
					new Date(reservation.fromDate) < toDateTime &&
					new Date(reservation.toDate) > fromDateTime
			);

			return isAvailable;
		} catch (error) {
			if (error instanceof Error) {
				toast.error("Error checking availability: " + error.message);
			} else {
				toast.error("An unknown error occurred");
			}
			return false;
		}
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

		// Check for room availability
		const isAvailable = await checkAvailability(
			combinedFromDateTime,
			combinedToDateTime,
			title
		);
		if (!isAvailable) {
			toast.error(
				"This room is fully booked for the selected time. Please choose another time or room."
			);
			return;
		}
		// Show confirmation modal before proceeding
		setShowConfirmationModal(true);
	};

	const handleConfirmReservation = async () => {
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

		try {
			// Attempt to send the email first
			const emailResponse = await fetch("/api/sendEmail", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(reservationData),
			});

			if (!emailResponse.ok) {
				throw new Error("Failed to send email");
			}

			// If email sending is successful, save the reservation
			const response = await fetch("/api/reservationDB", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(reservationData),
			});

			if (response.ok) {
				// Close confirmation modal after submission
				setShowConfirmationModal(false);
				toast.success("Reservation saved successfully!");

				setTimeout(() => {
					window.location.reload();
				}, 5000);
			} else {
				throw new Error("Failed to save reservation: " + response.statusText);
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
	const handleCancelReservation = () => {
		// Close confirmation modal
		setShowConfirmationModal(false);
	};

	return (
		<div className=" pb-10">
			<ToastContainer autoClose={5000} />
			<div className="flex gap-2 bg-[#e81e83] lg:py-1 22xl:py-2 justify-center">
				<div>
					<h1 className="text-2xl lg:text-xl 2xl:text-2xl font-bold text-white">
						Welcome User
					</h1>
				</div>
			</div>

			<div className="h-screen grid grid-cols-1 lg:grid-cols-2 lg:px-[80px] 2xl:px-[330px] lg:w-full lg:h-[763px] lg:ml-0 2xl:w-full 2xl:ml-0 2xl:mt-0 2xl:h-[877px] 2xl:pl-14 2xl:pt-12 lg:py-6">
				<div className="flex flex-col items-start lg:gap-4 2xl:gap-6 pl-6 lg:px-10 2xl:px-14">
					<div className="lg:-ml-10 lg:pb-5 2xl:pb-0 2xl:ml-6 py-4 ml-8 md:ml-[14rem]">
						<span className="text-2xl lg:text-3xl 2xl:text-4xl tracking-wide font-black font-sans text-[#e61e84]">
							Calendar Reservation
						</span>
					</div>
					<div className="flex flex-col w-full lg:gap-3 2xl:gap-4 lg:w-[300px] 2xl:w-[600px] lg:-ml-10 2xl:ml-6 gap-4 md:ml-12">
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
								className="lg:w-[350px] xl:w-[28rem] 2xl:w-full lg:text-[16px] 2xl:text-[18px] lg:px-4 lg:py-1 2xl:py-2 border rounded-md ml-4 text-sm p-1 border-[#e61e84]"
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
								className="lg:w-[350px] xl:w-[28rem] 2xl:w-full lg:text-[16px] 2xl:text-[18px] lg:px-4 lg:py-1 2xl:py-2 border rounded-md ml-4 text-sm p-1 border-[#e61e84]"
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
								className="lg:w-[350px] xl:w-[28rem] 2xl:w-full lg:text-[16px] 2xl:text-[18px] lg:px-4 lg:py-1 2xl:py-2 border rounded-md ml-4 text-sm p-1 border-[#e61e84]"
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
								className="lg:w-[350px] xl:w-[28rem] 2xl:w-full lg:text-[16px] 2xl:text-[18px] lg:px-4 lg:py-1 2xl:py-2 border rounded-md ml-4 text-sm p-1 border-[#e61e84]"
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
								<label className="text-[#e61e84] lg:text-[16px] 2xl:text-[15px]">
									<input
										type="radio"
										value="Zoom"
										checked={title === "Zoom"}
										onChange={handletitleChange}
										className="mr-1"
									/>
									Zoom
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
							<div className="xl:absolute xl:top-[40rem]">
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
									className="lg:w-[350px] xl:w-[28rem] 2xl:w-full lg:text-[16px] 2xl:text-[18px] px-4 lg:py-1 2xl:py-2 border rounded-md"
									placeholder="Please provide the reason"
								/>
							</div>
						)}
					</div>
				</div>
				<div className="col-span-1 ">
					<div className="lg:pb-5 2xl:pb-0 2xl:ml-0 2xl:flex 2xl:justify-end">
						<span className=" text-2xl justify-center flex lg:text-3xl text-[#e61e84] 2xl:text-[35px] mt-4 font-sans tracking-wide font-extrabold">
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
				</div>
				<form onSubmit={handleContinue}>
					<button
						type="submit"
						className="lg:absolute lg:top-[51rem] lg:right-[23rem] xl:right-[29rem] 2xl:top-[60rem] 2xl:right-[42rem] bg-[#e61e84] lg:mt-0 2xl:mt-2 hover:bg-[#3fa8ee] 2xl:text-[18px] font-extrabold text-white rounded text-[12px] w-auto p-2 uppercase ml-6 mb-10 md:ml-14"
					>
						Submit
					</button>
				</form>
			</div>
			<ConfirmationModal
				isOpen={showConfirmationModal}
				onRequestClose={handleCancelReservation}
				onConfirm={handleConfirmReservation}
				title="Confirm Reservation"
				message="Are you sure you want to confirm this reservation?"
			/>
		</div>
	);
};

export default Dashboard;
