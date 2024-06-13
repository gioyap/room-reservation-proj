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

	// Handle day click
	const handleDayClick = (date: Date) => {
		onChange(date);
		setSelectedReservation([]);
		setSelectedDateState(date);
		setClickedDate(date);
		setSelectedCategory(null); // Reset category when day is clicked
		setSelectedAvailableCategory(null); // Reset available category when day is clicked
	};

	// Handle booked day click
	const handleBookedDayClick = (reservation: Reservation) => {
		const date = new Date(reservation.fromDate);
		onChange(date);
		const reservationsForDate = bookedDates.filter(
			(res) => new Date(res.fromDate).toDateString() === date.toDateString()
		);
		setSelectedReservation(reservationsForDate);
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
			? day.toDateString() === selectedDateState.toDateString()
			: false;
		return `${isSelected ? "text-[#e61e84] font-extrabold" : ""} ${
			isFullyBookedDay ? "text-red-500 font-extrabold" : ""
		} ${isBooked && !isFullyBookedDay ? "booked-day relative" : ""} ${
			isClickable ? "selectable-day cursor-pointer hover:text-[#e61e84]" : ""
		} ${day.getMonth() !== selectedDate.getMonth() ? "text-gray-400" : ""}`;
	};

	const handleMonthChange = (increment: number) => {
		const newDate = addMonths(currentDate, increment);
		setCurrentDate(newDate);
		onChange(newDate);
	};

	const handleMonthSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newDate = setMonth(currentDate, parseInt(e.target.value));
		setCurrentDate(newDate);
		onChange(newDate);
	};

	const handleYearSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newDate = setYear(currentDate, parseInt(e.target.value));
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

	// Handle category click
	const handleCategoryClick = (category: string) => {
		setSelectedCategory(selectedCategory === category ? null : category);
	};

	// Handle available category click
	const handleAvailableCategoryClick = (category: string) => {
		setSelectedAvailableCategory(
			selectedAvailableCategory === category ? null : category
		);
	};

	// Get available times for the selected category
	const getAvailableTimes = (category: string): { from: Date; to: Date }[] => {
		if (!clickedDate) {
			return []; // Return empty array if clickedDate is null
		}

		// Filter booked dates for the selected category and date
		const bookedTimes = bookedDates
			.filter(
				(reservation) =>
					reservation.title === category &&
					new Date(reservation.fromDate).toDateString() ===
						clickedDate.toDateString() &&
					reservation.status === "Accepted" // Include only accepted reservations
			)
			.map((reservation) => ({
				from: new Date(reservation.fromDate),
				to: new Date(reservation.toDate),
			}));

		// Sort booked times by start time
		bookedTimes.sort((a, b) => a.from.getTime() - b.from.getTime());

		const workingHours: { from: Date; to: Date }[] = [];
		let lastEndTime = new Date(clickedDate);
		lastEndTime.setHours(8, 0, 0, 0); // Set initial end time to 8:00 AM

		// Loop through booked times to determine available times
		bookedTimes.forEach((bookedTime) => {
			// Check if there's a gap between last end time and current start time
			if (bookedTime.from.getTime() > lastEndTime.getTime()) {
				// Add available time from last end time to current start time
				workingHours.push({
					from: new Date(lastEndTime),
					to: new Date(bookedTime.from),
				});
			}
			// Update last end time to current end time
			lastEndTime = bookedTime.to;
		});

		// Add available time after the last booked time until 6:00 PM
		const endWorkingTime = new Date(clickedDate);
		endWorkingTime.setHours(18, 0, 0, 0); // Set end time to 6:00 PM
		if (lastEndTime.getTime() < endWorkingTime.getTime()) {
			workingHours.push({
				from: new Date(lastEndTime),
				to: new Date(endWorkingTime),
			});
		}

		return workingHours;
	};

	// Function to generate time options in standard format (AM/PM)
	const generateTimeOptions = (): string[] => {
		const options: string[] = [];
		for (let i = 8; i <= 18; i++) {
			for (let j = 0; j < 60; j += 30) {
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
				<div className="header text-center lg:mb-1 2xl:mb-4 flex justify-between items-center">
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
								className={`day text-center cursor-pointer pt-4 ${getDayClassName(
									day
								)} ${
									day.getMonth() !== selectedDate.getMonth()
										? "text-gray-400"
										: ""
								}`}
								onClick={() =>
									reservation
										? handleBookedDayClick(reservation)
										: handleDayClick(day)
								}
								style={{ margin: "-2px" }} // Adjust this value to achieve the desired gap
							>
								{format(day, "d")}
								{isDateBooked(day) && (
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
			<div className="time-table bg-white p-4 lg:w-[150px] 2xl:w-[250px] rounded shadow">
				<div className="header text-left mb-0">
					<span className="lg:text-md 2xl:text-lg font-extrabold text-[#e61e84]">
						From:
					</span>
				</div>
				<select
					value={format(selectedTime, "hh:mm aa")}
					onChange={handleTimeChange}
					className="w-full lg:px-1 lg:py-1 2xl:px-3 2xl:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 lg:text-[12px] 2xl:text-[16px]"
				>
					{generateTimeOptions().map((time) => (
						<option key={time} value={time}>
							{time}
						</option>
					))}
				</select>
				<div className="header text-left mb-2 mt-2">
					<span className="lg:text-md 2xl:text-lg font-extrabold text-[#e61e84]">
						To:
					</span>
					<select
						value={format(toSelectedTime, "hh:mm aa")}
						onChange={handleToTimeChange}
						className="w-full lg:px-1 lg:py-1 2xl:px-3 2xl:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 lg:text-[12px] 2xl:text-[16px]"
					>
						{generateTimeOptions().map((time) => (
							<option key={time} value={time}>
								{time}
							</option>
						))}
					</select>
				</div>
			</div>
			{/* able to see the availability of time */}
			<div className="availability bg-white lg:p-2 2xl:p-4 lg:w-[200px] 2xl:w-[300px] lg:top-[200px] 2xl:top-[20px] absolute lg:left-[385px] 2xl:left-[740px] rounded shadow overflow-y-auto max-h-[400px] lg:h-[215px] 2xl:h-[500px]">
				<h2 className="lg:text-[14px] 2xl:text-lg font-extrabold text-[#e61e84] lg:mt-1 2xl:mt-2 lg:mb-0 2xl:mb-2">
					Unavailable Time
				</h2>
				<div>
					{["Energy", "Focus", "Lecture"].map((category) => (
						<div key={category}>
							<button
								onClick={() => handleCategoryClick(category)}
								className="category-button lg:mb-0 2xl:mb-2 font-bold 2w-[100px] text-left hover:bg-[#e61e84] hover:text-white hover:rounded-full pl-4 lg:text-[12px] 2xl:text-[16px] "
							>
								{category}
							</button>
							{selectedCategory === category && (
								<div className="overflow-y-auto max-h-[200px] lg:text-[12px] 2xl:text-[16px]">
									{bookedDates
										.filter(
											(reservation) =>
												reservation.title === category &&
												clickedDate &&
												new Date(reservation.fromDate).toDateString() ===
													clickedDate.toDateString() &&
												(reservation.status === "Accepted" ||
													reservation.status === "Pending")
										)
										.map((reservation, index) => (
											<div key={index} className="pl-4">
												<p>
													<span className="font-bold text-[#e61e84]">
														Company:
													</span>{" "}
													{reservation.company}
												</p>
												<p>
													<span className="font-bold text-[#e61e84]">
														Department:
													</span>{" "}
													{reservation.department}
												</p>
												<p>
													<span className="font-bold text-[#e61e84]">
														Name:
													</span>{" "}
													{reservation.name}
												</p>
												<p>
													<span className="font-bold text-[#e61e84]">
														Room:
													</span>{" "}
													{reservation.title}
												</p>
												<p>
													<span className="font-bold text-[#e61e84]">
														From:
													</span>{" "}
													{new Date(reservation.fromDate).toLocaleString()}
												</p>
												<p>
													<span className="font-bold text-[#e61e84]">To:</span>{" "}
													{new Date(reservation.toDate).toLocaleTimeString()}
												</p>
												<p>
													<span className="font-bold text-[#e61e84]">
														Status:
													</span>{" "}
													<span
														className={`rounded-full px-2 py-[1px] text-white ${
															reservation.status === "Accepted"
																? "bg-green-600"
																: "bg-yellow-500"
														}`}
													>
														{reservation.status || "Pending"}
													</span>
												</p>
												<hr className="my-2" />
											</div>
										))}
								</div>
							)}
						</div>
					))}
				</div>

				<h2 className="lg:text-[14px] 2xl:text-lg font-extrabold text-[#e61e84] lg:mt-1 2xl:mt-2 lg:mb-0 2xl:mb-2">
					Available Time
				</h2>
				<div>
					{["Energy", "Focus", "Lecture"].map((category) => (
						<div key={category}>
							<button
								onClick={() => handleAvailableCategoryClick(category)}
								className="category-button lg:mb-0 xl:mb-2 font-bold w-[100px] text-left hover:bg-[#e61e84] hover:text-white hover:rounded-full pl-4 lg:text-[12px] 2xl:text-[16px]"
							>
								{category}
							</button>
							{selectedAvailableCategory === category &&
								getAvailableTimes(category).map((time, index) => (
									<div
										key={index}
										className="pl-4 lg:text-[12px] 2xl:text-[16px]"
									>
										<p>
											<span className="font-bold text-[#e61e84]">From:</span>{" "}
											{time.from.toLocaleTimeString()}
										</p>
										<p>
											<span className="font-bold text-[#e61e84]">To:</span>{" "}
											{time.to.toLocaleTimeString()}
										</p>
										<hr className="my-2" />
									</div>
								))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Calendar;
