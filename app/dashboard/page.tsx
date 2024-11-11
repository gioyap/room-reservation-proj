"use client";

import React, { useState } from "react";
import Calendar from "../../components/Calendar"; // Import Calendar component
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const companies = [
	"Flawless",
	"Mixexpert Trading Services and Inc.",
	"FINA",
	"Beauty and Butter",
];
import { Reservation } from "../../types/type";
import ConfirmationModal from "../../components/ConfirmationModal";

const departments = [
	"Executive",
	"Operations",
	"Accounting",
	"Audit",
	"Sales",
	"Marketing",
	"HR",
	"SCM",
	"Procurement",
	"MIS-IT",
	"CRMT",
	"MARTD",
	"BDD",
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
	const [isSubmitting, setIsSubmitting] = useState(false);

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
					reservation.status === "Accepted" &&
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

		const emailRegex =
			/^[a-zA-Z0-9._%+-]+@(beautyandbutter\.com|mixexpert\.com\.ph|flawless\.ph|finafranchising\.com|gmail\.com)$/;
		if (!emailRegex.test(email)) {
			toast.error("Please input a valid email");
			return; // Prevent submission
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
		if (isSubmitting) return; // Prevent double clicks
		setIsSubmitting(true); // Disable the button and show loading state

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
					window.location.reload(); // Reload the page after 5 seconds
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
		} finally {
			// Re-enable button in all cases (success or failure)
			setIsSubmitting(false);
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
			<div className="flex justify-center pt-2 lg:hidden">
				<img src="mobile.png" alt="header" />
			</div>
			<div className="lg:flex justify-center pt-2 hidden 2xl:hidden">
				<img src="tablet.png" alt="header" />
			</div>
			<div className="2xl:flex justify-center pt-2 hidden">
				<img src="desktop.png" alt="header" />
			</div>
			{/* 
			<div className="absolute right-0 top-0">
				<div className="hidden lg:block md:size-64 lg:size-72 xl:size-80 2xl:size-96 -mr-36 mt-4 md:-mr-28 md:-mt-10 lg:-mr-44 lg:-mt-20">
					<img src="design.png" alt="top" />
				</div>
			</div> */}

			<div className="absolute left-0 bottom-0">
				<div className="hidden md:block md:size-64 lg:size-72 xl:size-80 2xl:size-96 md:-ml-48 md:-mb-[20rem] lg:-ml-48 lg:-mb-[20rem] xl:-mb-[18rem] 2xl:-mb-[25rem]">
					<img src="design2.png" alt="top" />
				</div>
			</div>

			<div className="h-screen grid grid-cols-1 lg:grid-cols-2 lg:px-[80px] 2xl:px-[330px] lg:w-full lg:h-[763px] lg:ml-0 2xl:w-full 2xl:ml-0 2xl:mt-0 2xl:h-[877px] 2xl:pl-14 2xl:pt-10 lg:py-6">
				<div className="flex flex-col items-start lg:gap-4 2xl:gap-6 pl-6 lg:px-10 2xl:px-14">
					<div className="lg:-ml-10 lg:pb-5 2xl:pb-0 2xl:ml-6 py-4 ml-8 md:ml-[14rem]">
						<span className="text-2xl lg:text-3xl 2xl:text-4xl tracking-wide font-black font-sans text-[#3f3f3f]">
							Calendar Reservation
						</span>
					</div>
					<div className="flex flex-col w-full lg:gap-3 2xl:gap-4 lg:w-[300px] 2xl:w-[600px] lg:-ml-10 2xl:ml-6 gap-4 md:ml-12">
						<div>
							<label
								className="lg:text-[18px] 2xl:text-[22px] text-[#3f3f3f] tracking-normal font-extrabold"
								htmlFor="email"
							>
								Email:
							</label>
							<input
								id="email"
								type="text"
								value={email}
								onChange={handleEmailChange}
								className="lg:w-[350px] xl:w-[28rem] 2xl:w-full lg:text-[16px] 2xl:text-[18px] lg:px-4 lg:py-1 2xl:py-2 border rounded-md ml-4 text-sm p-1 border-[#3f3f3f]"
								placeholder="example123@gmail.com"
							/>
						</div>
						<div>
							<label
								className="lg:text-[18px] 2xl:text-[22px] text-[#3f3f3f] tracking-normal font-extrabold"
								htmlFor="company"
							>
								Company:
							</label>
							<select
								id="company"
								value={company}
								onChange={handleCompanyChange}
								className="w-[10rem] lg:w-[350px] xl:w-[28rem] 2xl:w-full lg:text-[16px] 2xl:text-[18px] lg:px-4 lg:py-1 2xl:py-2 border rounded-md ml-4 text-sm p-1 border-[#3f3f3f]"
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
								className="lg:text-[18px] 2xl:text-[22px] text-[#3f3f3f] tracking-normal font-extrabold"
								htmlFor="department"
							>
								Department:
							</label>
							<select
								id="department"
								value={department}
								onChange={handleDepartmentChange}
								className="lg:w-[350px] xl:w-[28rem] 2xl:w-full lg:text-[16px] 2xl:text-[18px] lg:px-4 lg:py-1 2xl:py-2 border rounded-md ml-4 text-sm p-1 border-[#3f3f3f]"
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
								className="lg:text-[18px] 2xl:text-[22px] text-[#3f3f3f] tracking-normal font-extrabold"
								htmlFor="name"
							>
								Full Name:
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={handleNameChange}
								className="lg:w-[350px] xl:w-[28rem] 2xl:w-full lg:text-[16px] 2xl:text-[18px] lg:px-4 lg:py-1 2xl:py-2 border rounded-md ml-4 text-sm p-1 border-[#3f3f3f]"
								placeholder="Enter your full name"
							/>
						</div>
						<div>
							<label
								className="lg:text-[18px] 2xl:text-[22px] text-[#3f3f3f] tracking-normal font-extrabold"
								htmlFor="title"
							>
								Room:
							</label>
							<div className="flex gap-2 pt-2">
								<label className="text-[#3f3f3f] lg:text-[16px] 2xl:text-[15px]">
									<input
										type="radio"
										value="Energy"
										checked={title === "Energy"}
										onChange={handletitleChange}
										className="mr-1"
									/>
									Energy
								</label>
								<label className="text-[#3f3f3f] lg:text-[16px] 2xl:text-[15px]">
									<input
										type="radio"
										value="Focus"
										checked={title === "Focus"}
										onChange={handletitleChange}
										className="mr-1"
									/>
									Focus
								</label>
								{/* <label className="text-[#3f3f3f] lg:text-[16px] 2xl:text-[15px]">
									<input
										type="radio"
										value="Lecture"
										checked={title === "Lecture"}
										onChange={handletitleChange}
										className="mr-1"
									/>
									Lecture
								</label> */}
								<label className="text-[#3f3f3f] lg:text-[16px] 2xl:text-[15px]">
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
							<div>
								<label
									className="lg:text-[18px] 2xl:text-[22px] text-[#3f3f3f] tracking-normal font-extrabold"
									htmlFor="description"
								>
									Urgent Notes:
								</label>
								<input
									id="description"
									type="description"
									value={description}
									onChange={handleDescriptionChange}
									className=" w-40 lg:w-[350px] xl:w-[28rem] 2xl:w-full lg:text-[16px] 2xl:text-[18px] px-4 lg:py-1 2xl:py-2 border border-[#3f3f3f] rounded-md ml-4"
									placeholder="Why urgent"
								/>
							</div>
						)}
					</div>
				</div>
				<div className="col-span-1 ">
					<div className="lg:pb-5 2xl:pb-0 2xl:ml-0 2xl:flex 2xl:justify-end">
						<span className=" text-2xl justify-center flex lg:text-3xl text-[#3f3f3f] 2xl:text-[35px] mt-4 font-sans tracking-wide font-extrabold">
							Select Reservation Date
						</span>
					</div>
					<div className="py-5 lg:absolute lg:left-[400px] custom-1240:left-[32rem] custom-1345:left-[26rem] xl:left-[380px] 2xl:relative 2xl:left-0">
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
						className="lg:absolute lg:top-[54rem] lg:right-[24rem] xl:right-[34rem] 2xl:top-[63rem] bg-[#3f3f3f] lg:mt-0 2xl:mt-2 hover:bg-[#686868] 2xl:text-[18px] font-extrabold text-white rounded text-[12px] w-auto p-2 uppercase ml-6 mb-10 md:ml-14 custom-1240:right-[26rem] custom-1345:right-[34rem] custom-1536:right-[34rem] custom-1700:right-[59rem]"
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
				isSubmitting={isSubmitting}
				isAdmin={false}
			/>
		</div>
	);
};

export default Dashboard;
