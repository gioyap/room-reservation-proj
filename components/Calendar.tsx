import React, { useState, useEffect } from "react";
import {
	format,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	addDays,
	parse,
	addMonths,
	setMonth,
	setYear,
	isSameDay,
	isBefore,
} from "date-fns";
import { Reservation } from "../types/type";

// Define the CalendarProps interface
interface CalendarProps {
	selectedDate: Date;
	selectedTime: Date;
	onChange: (date: Date) => void;
	onTimeChange: (time: Date) => void;
	toSelectedTime: Date;
	onToTimeChange: (time: Date) => void;
	reservations: Reservation[];
}

// Define the Calendar component
const Calendar: React.FC<CalendarProps> = ({
	selectedDate,
	onChange,
	onTimeChange,
	toSelectedTime,
	onToTimeChange,
}) => {
	const [currentDate, setCurrentDate] = useState(selectedDate);
	const monthStart = startOfMonth(selectedDate);
	const monthEnd = endOfMonth(selectedDate);
	const fromDate = startOfWeek(monthStart);
	const endDate = endOfWeek(monthEnd);
	const [bookedDates, setBookedDates] = useState<Reservation[]>([]);
	const [selectedReservation, setSelectedReservation] = useState<Reservation[]>(
		[]
	);
	const [selectedDateState, setSelectedDateState] = useState<Date | null>(null);
	const [clickedDate, setClickedDate] = useState<Date | null>(null);
	const [selectedTime, setSelectedTime] = useState<Date>(new Date());
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [selectedAvailableCategory, setSelectedAvailableCategory] = useState<
		string | null
	>(null);
	const [reservationDetails, setReservationDetails] = useState<Reservation[]>(
		[]
	);

	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	// Fetch booked dates on component mount
	useEffect(() => {
		fetchBookedDates().then((data) => {
			setBookedDates(data);
		});
	}, []);

	// Fetch booked dates from the API
	const fetchBookedDates = async () => {
		try {
			const response = await fetch("/api/reservationDB");
			if (response.ok) {
				const data = await response.json();
				if (Array.isArray(data.reservations)) {
					return data.reservations;
				} else {
					console.error(
						"Data.reservations is not an array:",
						data.reservations
					);
					return [];
				}
			} else {
				console.error("Failed to fetch booked dates:", response.statusText);
				return [];
			}
		} catch (error) {
			console.error("Error fetching booked dates:", error);
			return [];
		}
	};

	const days: Date[] = [];
	let day = fromDate;
	while (day <= endDate) {
		days.push(day);
		day = addDays(day, 1);
	}

	const formattedSelectedTime = selectedTime.toLocaleTimeString([], {
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

	// Handle day click
	const handleDayClick = (date: Date) => {
		onChange(date);
		setSelectedReservation([]);
		setSelectedDateState(date);
		setClickedDate(date);
		setSelectedCategory(null); // Reset category when day is clicked
		setSelectedAvailableCategory(null); // Reset available category when day is clicked
	};

	// Handle time change
	const handleTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;
		const time = parse(value, "hh:mm aa", new Date());
		setSelectedTime(time);
		onTimeChange(time);
	};

	// Handle "to" time change
	const handleToTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;
		const time = parse(value, "hh:mm aa", new Date());
		onToTimeChange(time);
	};

	// Check if date is booked
	const isDateBooked = (date: Date) => {
		return bookedDates.some(
			(bookedDate) =>
				new Date(bookedDate.fromDate).toDateString() === date.toDateString()
		);
	};

	// Condition color indicator
	const getBookingStatusColor = (date: Date) => {
		const reservations = bookedDates.filter(
			(res) => new Date(res.fromDate).toDateString() === date.toDateString()
		);

		const hasAccepted = reservations.some((res) => res.status === "Accepted");
		const hasPending = reservations.some((res) => res.status === "Pending");

		if (hasAccepted && hasPending) {
			// If both "Accepted" and "Pending" reservations exist
			return "bg-[#65fe08]"; // Apply both colors
		} else if (hasAccepted) {
			return "bg-green-500";
		} else if (hasPending) {
			return "bg-[#ffca1a]";
		}
		return ""; // Default color if not booked
	};

	// Check if a date is fully booked
	const isFullyBooked = (date: Date) => {
		const categories = ["Energy", "Focus", "Lecture"];
		const reservationsForDate = bookedDates.filter(
			(reservation) =>
				new Date(reservation.fromDate).toDateString() === date.toDateString() &&
				reservation.status === "Accepted"
		);

		// Check if all categories are booked
		const categoriesBooked = categories.every((category) =>
			reservationsForDate.some((res) => res.title === category)
		);

		if (!categoriesBooked) {
			return false;
		}

		// Check if the time slots from 8 AM to 6 PM are fully booked for each category
		const workingHours = {
			start: new Date(date.setHours(8, 0, 0, 0)),
			end: new Date(date.setHours(18, 0, 0, 0)),
		};

		const isTimeFullyBooked = (category: string) => {
			const reservationsForCategory = reservationsForDate.filter(
				(res) => res.title === category
			);

			let totalBookedTime = 0;
			reservationsForCategory.forEach((reservation) => {
				const from = new Date(reservation.fromDate);
				const to = new Date(reservation.toDate);
				if (from >= workingHours.start && to <= workingHours.end) {
					totalBookedTime += (to.getTime() - from.getTime()) / (1000 * 60 * 60); // Calculate total booked time in hours
				}
			});

			return totalBookedTime >= 10; // 8 AM to 6 PM is 10 hours
		};

		return categories.every((category) => isTimeFullyBooked(category));
	};

	// through this condition the user can see if the date is fully booked, have a reservation details and interactive to the user
	const getDayClassName = (day: Date) => {
		const isBooked = isDateBooked(day);
		const isFullyBookedDay = isFullyBooked(day);
		const isClickable = day.getMonth() === currentDate.getMonth();
		const isSelected = selectedDateState
			? isSameDay(day, selectedDateState)
			: false;
		const isPast = isBefore(day, new Date());
		const isWeekend = day.getDay() === 0 || day.getDay() === 6; // Sunday or Saturday

		let className = "text-center pt-4 ";

		if (isPast || isWeekend) {
			className += "text-gray-400 bg-gray-100 cursor-not-allowed ";
		} else {
			className += isClickable
				? "selectable-day cursor-pointer hover:text-[#e61e84] "
				: "";
			className += isSelected ? "text-[#e61e84] font-extrabold " : "";
			className += isFullyBookedDay
				? "text-red-500 font-extrabold bg-red-100 rounded-lg"
				: "";
			className += isBooked && !isFullyBookedDay ? "booked-day relative " : "";
			className +=
				day.getMonth() !== selectedDate.getMonth() ? "text-gray-400" : "";
		}

		return className;
	};

	const handleMonthChange = (increment: number) => {
		const newDate = addMonths(currentDate, increment);
		setCurrentDate(newDate);
		onChange(newDate);
	};

	const handleMonthSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newDate = setMonth(currentDate, parseInt(e.target.value, 10));
		setCurrentDate(newDate);
		onChange(newDate);
	};

	const handleYearSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newDate = setYear(currentDate, parseInt(e.target.value, 10));
		setCurrentDate(newDate);
		onChange(newDate);
	};

	const renderYearOptions = () => {
		const startYear = new Date().getFullYear();
		const yearOptions = [];
		for (let i = startYear; i <= startYear + 10; i++) {
			yearOptions.push(
				<option key={i} value={i}>
					{i}
				</option>
			);
		}
		return yearOptions;
	};

	// Function to handle showing reservation details
	const showReservationDetails = (
		category: string,
		date: Date | null = null
	) => {
		const reservations = bookedDates.filter(
			(res) =>
				res.title === category &&
				(res.status === "Accepted" || res.status === "Pending") &&
				(!date ||
					new Date(res.fromDate).toLocaleDateString() ===
						date.toLocaleDateString())
		);
		setReservationDetails(reservations);
	};

	// Function to generate time options in standard format (AM/PM)
	const generateTimeOptions = (): string[] => {
		const options: string[] = [];
		for (let i = 8; i <= 18; i++) {
			for (let j = 0; j < 60; j += 60) {
				const hour = i > 12 ? i - 12 : i;
				const ampm = i >= 12 ? "PM" : "AM";
				const hourString = hour.toString().padStart(2, "0");
				const minuteString = j.toString().padStart(2, "0");
				options.push(`${hourString}:${minuteString} ${ampm}`);
			}
		}
		return options;
	};

	return (
		<div className="flex gap-x-3 items-start">
			{/* this is responsible for calendar */}
			<div className="calendar bg-white lg:p-2 2xl:p-6 rounded shadow mr-2">
				<div className="header text-center lg: 2xl:mb-4 flex justify-between items-center">
					<button
						onClick={() => handleMonthChange(-1)}
						className="arrow-button lg:text-[12px] 2xl:text-[16px]"
					>
						&lt;
					</button>
					<div>
						<select
							value={currentDate.getMonth()}
							onChange={handleMonthSelect}
							className="mr-8 lg:text-[12px] 2xl:text-[16px]"
						>
							{months.map((month, index) => (
								<option key={index} value={index}>
									{month}
								</option>
							))}
						</select>
						<select
							value={currentDate.getFullYear()}
							onChange={handleYearSelect}
							className="lg:text-[12px] 2xl:text-[16px]"
						>
							{renderYearOptions()}
						</select>
					</div>
					<button
						onClick={() => handleMonthChange(1)}
						className="arrow-button lg:text-[12px] 2xl:text-[16px]"
					>
						&gt;
					</button>
				</div>
				<div className="weekdays grid grid-cols-7 gap-1 text-center lg:text-[12px] 2xl:text-[16px]">
					{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
						<div key={day} className="font-bold">
							{day}
						</div>
					))}
				</div>
				<div className="grid grid-cols-7 gap-[-4px] lg:w-[350px] 2xl:w-[400px] lg:h-[250px] 2xl:h-[350px] lg:mb-0 2xl:-mb-4 lg:text-[12px] 2xl:text-[16px]">
					{days.map((day, index) => {
						const reservation = bookedDates.find(
							(res) =>
								new Date(res.fromDate).toDateString() === day.toDateString()
						);
						return (
							<div
								key={index}
								className={`day text-center pt-4 ${getDayClassName(day)}`}
								onClick={() => {
									if (
										!isBefore(day, new Date()) &&
										day.getDay() !== 0 &&
										day.getDay() !== 6 &&
										day.getMonth() === currentDate.getMonth() // Ensure the clicked date is in the current month
									) {
										handleDayClick(day);
									}
								}}
								style={{ margin: "-2px" }} // Adjust this value to achieve the desired gap
							>
								{format(day, "d")}
								{isDateBooked(day) &&
									day.getMonth() === selectedDate.getMonth() && (
										<span
											className={`absolute lg:w-1.5 lg:h-1.5 2xl:w-2 2xl:h-2 rounded-full top-2 lg:right-6 ${getBookingStatusColor(
												day
											)}`}
										></span>
									)}
							</div>
						);
					})}
				</div>
			</div>
			{/* Choose the desired time */}
			<div className="time-table bg-white lg:p-2 2xl:p-4 lg:w-[210px] 2xl:w-[1050px] rounded shadow flex justify-between lg:gap-x-0 2xl:gap-x-5">
				<div className="header text-left mb-0">
					<span className="lg:text-md 2xl:text-lg font-extrabold text-[#e61e84]">
						From:
					</span>
					<select
						value={format(selectedTime, "hh:mm aa")}
						onChange={handleTimeChange}
						className="lg:px-1 lg:py-1 2xl:px-3 2xl:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 lg:text-[12px] 2xl:text-[16px]"
					>
						{generateTimeOptions().map((time) => (
							<option key={time} value={time}>
								{time}
							</option>
						))}
					</select>
				</div>
				<div className="header text-left">
					<span className="lg:text-md 2xl:text-lg font-extrabold text-[#e61e84]">
						To:
					</span>
					<select
						value={format(toSelectedTime, "hh:mm aa")}
						onChange={handleToTimeChange}
						className="lg:px-1 lg:py-1 2xl:px-3 2xl:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 lg:text-[12px] 2xl:text-[16px]"
					>
						{generateTimeOptions().map((time) => (
							<option key={time} value={time}>
								{time}
							</option>
						))}
					</select>
				</div>
			</div>
			{/* Time selection table */}
			<div className="lg:w-[480px] 2xl:w-[600px] p-4 border rounded-lg shadow-lg absolute lg:top-[110px] lg:left-[380px] 2xl:top-[140px] 2xl:left-[468px]">
				<div className="flex gap-x-10 text-center mb-4">
					<div>
						<p className="lg:text-[12px] 2xl:text-[18px] font-extrabold text-[#e61e84]">
							Selected Date:{" "}
							<span className="2xl:text-[16px] lg:text-[12px] text-black font-normal">
								{selectedDateState ? selectedDate.toDateString() : "None"}
							</span>
						</p>
					</div>
					<div>
						<p className="lg:text-[12px] 2xl:text-[18px] font-extrabold text-[#e61e84]">
							From:{" "}
							<span className="2xl:text-[16px] lg:text-[12px] text-black font-normal">
								{formattedSelectedTime}
							</span>
						</p>
						<p className="lg:text-[12px] 2xl:text-[16px]"></p>
					</div>
					<div>
						<p className="lg:text-[12px] 2xl:text-[18px] font-extrabold text-[#e61e84]">
							To:{" "}
							<span className="2xl:text-[16px] lg:text-[12px] text-black font-normal">
								{formattedToSelectedTime}
							</span>
						</p>
					</div>
				</div>
				{clickedDate && (
					<div>
						<table className="w-full text-left">
							<thead>
								<tr>
									<th className="p-2 lg:pl-0 2xl:pl-2 border-b lg:text-[14px] 2xl:text-[16px]">
										Time
									</th>
									<th
										className="p-2 border-b lg:text-[14px] 2xl:text-[16px] lg:pl-4 2xl:pl-2 cursor-pointer hover:bg-[#fe93cb] rounded-full text-center"
										onClick={() =>
											showReservationDetails("Energy", selectedDateState)
										}
									>
										<span className="">Energy</span>
									</th>
									<th
										className="p-2 border-b lg:text-[14px] 2xl:text-[16px] lg:pl-4 2xl:pl-2 cursor-pointer hover:bg-[#fe93cb] rounded-full text-center"
										onClick={() =>
											showReservationDetails("Focus", selectedDateState)
										}
									>
										Focus
									</th>
									<th
										className="p-2 border-b lg:text-[14px] 2xl:text-[16px] lg:pl-4 2xl:pl-2 cursor-pointer hover:bg-[#fe93cb] rounded-full text-center"
										onClick={() =>
											showReservationDetails("Lecture", selectedDateState)
										}
									>
										Lecture
									</th>
								</tr>
							</thead>
							<tbody>
								{Array.from({ length: 10 }, (_, i) => {
									const startTime = new Date(clickedDate);
									startTime.setHours(8 + i, 0, 0, 0);
									const endTime = new Date(startTime);
									endTime.setHours(startTime.getHours() + 1);

									const isAvailable = (category: string) => {
										// Filter reservations for the category, date, and status
										const reservationsForCategory = bookedDates.filter(
											(reservation) =>
												new Date(reservation.fromDate).toDateString() ===
													clickedDate.toDateString() &&
												reservation.title === category
										);

										// Check if there's any accepted reservation for the time slot
										const hasAcceptedReservation = reservationsForCategory.some(
											(reservation) =>
												reservation.status === "Accepted" &&
												!(
													endTime <= new Date(reservation.fromDate) ||
													startTime >= new Date(reservation.toDate)
												)
										);

										// If there is an accepted reservation, return "Unavailable"
										if (hasAcceptedReservation) {
											return "Unavailable";
										}

										// Check if there's any pending reservation for the time slot
										const hasPendingReservation = reservationsForCategory.some(
											(reservation) =>
												reservation.status === "Pending" &&
												!(
													endTime <= new Date(reservation.fromDate) ||
													startTime >= new Date(reservation.toDate)
												)
										);

										// If there's no accepted reservation but there's a pending one, return "Pending"
										if (hasPendingReservation) {
											return "Pending";
										}

										// Otherwise, return "Available"
										return "Available";
									};

									return (
										<tr key={i}>
											<td className="2xl:p-2 border-b whitespace-nowrap lg:text-[12px] 2xl:text-[14px]">
												{format(startTime, "h:mm aa")} -{" "}
												{format(endTime, "h:mm aa")}
											</td>
											<td
												className={`lg:p-0 2xl:p-2 border-b whitespace-nowrap lg:text-[12px] 2xl:text-[14px] lg:pl-4 font-bold text-center ${
													isAvailable("Energy") === "Available"
														? "text-green-500"
														: isAvailable("Energy") === "Pending"
														? "text-yellow-500"
														: "text-red-500"
												}`}
											>
												{isAvailable("Energy")}
											</td>
											<td
												className={`lg:p-0 2xl:p-2 border-b whitespace-nowrap lg:text-[12px] 2xl:text-[14px] lg:pl-4 font-bold text-center ${
													isAvailable("Focus") === "Available"
														? "text-green-500"
														: isAvailable("Focus") === "Pending"
														? "text-yellow-500"
														: "text-red-500"
												}`}
											>
												{isAvailable("Focus")}
											</td>
											<td
												className={`lg:p-0 2xl:p-2 border-b whitespace-nowrap lg:text-[12px] 2xl:text-[14px] lg:pl-4 font-bold text-center ${
													isAvailable("Lecture") === "Available"
														? "text-green-500"
														: isAvailable("Lecture") === "Pending"
														? "text-yellow-500"
														: "text-red-500"
												}`}
											>
												{isAvailable("Lecture")}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
			{reservationDetails.length > 0 && (
				<div className="reservation-details-container">
					<div className="reservation-details absolute lg:-top-[45px] lg:left-[610px] 2xl:-top-[75px] 2xl:left-[790px] 2xl:w-[290px] bg-white border rounded-lg shadow-lg p-2 pl-4 lg:w-[200px]">
						<h3 className="lg:text-[14px] 2xl:text-lg font-bold mb-1 text-[#e61e84]">
							Reservation Details
						</h3>
						<div className="lg:h-[114px] 2xl:h-[136px] overflow-y-auto">
							<ul>
								{reservationDetails.map((detail, index) => (
									<li
										key={index}
										className="lg:mb-2 2xl:mb-4 lg:text-[12px] 2xl:text-[16px]"
									>
										<p>
											<strong className="text-[#e61e84]">Name:</strong>{" "}
											{detail.name}
										</p>
										<p>
											<strong className="text-[#e61e84]">Room:</strong>{" "}
											{detail.title}
										</p>
										<p>
											<strong className="text-[#e61e84]">From:</strong>{" "}
											{format(new Date(detail.fromDate), "hh:mm aa")}
										</p>
										<p>
											<strong className="text-[#e61e84]">To:</strong>{" "}
											{format(new Date(detail.toDate), "hh:mm aa")}
										</p>
										<p className="mb-1">
											<strong className="text-[#e61e84]">Status:</strong>{" "}
											<span
												className={`inline-block py-1 px-2 rounded-lg font-bold ${
													detail.status === "Pending"
														? "bg-yellow-100 text-yellow-600"
														: "bg-green-100 text-green-600"
												}`}
											>
												{detail.status}
											</span>
										</p>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Calendar;
