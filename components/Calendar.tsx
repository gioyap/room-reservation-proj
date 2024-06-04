import React, { useState, useEffect } from "react";
import {
	format,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	addDays,
	startOfDay,
	parse,
	addMonths,
	setMonth,
	setYear,
} from "date-fns";

interface Reservation {
	_id: string;
	company: string;
	department: string;
	name: string;
	title: string;
	fromDate: Date;
	toDate: Date;
	status: string;
}

interface CalendarProps {
	selectedDate: Date;
	selectedTime: Date;
	onChange: (date: Date) => void;
	onTimeChange: (time: Date) => void;
	toSelectedTime: Date;
	onToTimeChange: (time: Date) => void;
	reservations: Reservation[];
}

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

	useEffect(() => {
		fetchBookedDates().then((data) => {
			setBookedDates(data);
		});
	}, []);

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

	const handleDayClick = (date: Date) => {
		onChange(date);
		setSelectedReservation([]);
		setSelectedDateState(date);
		setClickedDate(date);
	};

	const handleBookedDayClick = (reservation: Reservation) => {
		const date = new Date(reservation.fromDate);
		onChange(date);

		const reservationsForDate = bookedDates.filter(
			(res) => new Date(res.fromDate).toDateString() === date.toDateString()
		);
		setSelectedReservation(reservationsForDate);
		setSelectedDateState(date);
	};

	const formatTime = (time: Date): string => {
		const hours = time.getHours().toString().padStart(2, "0");
		const minutes = time.getMinutes().toString().padStart(2, "0");
		return `${hours}:${minutes}`;
	};

	const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		const time = parse(value, "HH:mm", new Date());
		setSelectedTime(time);
		onTimeChange(time);
	};

	const handleToTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		const time = parse(value, "HH:mm", new Date());
		onToTimeChange(time);
	};

	const isDateBooked = (date: Date) => {
		return bookedDates.some(
			(bookedDate) =>
				new Date(bookedDate.fromDate).toDateString() === date.toDateString()
		);
	};

	const getDayClassName = (day: Date) => {
		const isBooked = isDateBooked(day);
		const isClickable = day.getMonth() === currentDate.getMonth();
		const isSelected = clickedDate
			? day.toDateString() === clickedDate.toDateString()
			: false;
		return `${isBooked ? "booked-day relative" : ""} ${
			isClickable ? "selectable-day cursor-pointer hover:text-[#e61e84]" : ""
		} ${isSelected ? "text-[#e61e84] font-extrabold" : ""}`;
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

	//the user cant click the backspace in selected time
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace") {
			e.preventDefault();
		}
	};

	return (
		<div className="flex gap-x-4 items-start">
			<div className="calendar bg-white p-8 rounded shadow mr-4">
				<div className="header text-center mb-4 flex justify-between items-center">
					<button
						onClick={() => handleMonthChange(-1)}
						className="arrow-button"
					>
						&lt;
					</button>
					<div>
						<select
							value={currentDate.getMonth()}
							onChange={handleMonthSelect}
							className="mr-8"
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
						>
							{renderYearOptions()}
						</select>
					</div>
					<button onClick={() => handleMonthChange(1)} className="arrow-button">
						&gt;
					</button>
				</div>
				<div className="grid grid-cols-7 w-[400px] h-[350px] -mb-4">
					{days.map((day, index) => {
						const reservation = bookedDates.find(
							(res) =>
								new Date(res.fromDate).toDateString() === day.toDateString()
						);
						return (
							<div
								key={index}
								className={`day text-center cursor-pointer py-4 ${getDayClassName(
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
							>
								{format(day, "d")}
								{isDateBooked(day) && (
									<span className="absolute w-2 h-2 bg-green-500 rounded-full top-2 right-6"></span>
								)}
							</div>
						);
					})}
				</div>
			</div>
			<div className="time-table bg-white p-4 rounded shadow">
				<div className="header text-center mb-4">
					<span className="text-lg font-extrabold text-[#e61e84]">From:</span>
				</div>
				<input
					type="time"
					value={formatTime(selectedTime)}
					onChange={handleTimeChange}
					onKeyDown={handleKeyDown}
					className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<div className="header text-center mb-4 mt-4">
					<span className="text-lg font-extrabold text-[#e61e84]">To:</span>
				</div>
				<input
					type="time"
					value={formatTime(toSelectedTime)}
					onChange={handleToTimeChange}
					onKeyDown={handleKeyDown}
					className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			{selectedReservation && selectedReservation.length > 0 && (
				<div
					className={`reservation-details bg-white lg:p-2 xl:p-4 rounded shadow absolute lg:ml-[300px] lg:mt-[150px] xl:ml-[485px] xl:mt-[250px] ${
						selectedReservation.length >= 3 ? "overflow-y-auto max-h-80" : ""
					}`}
				>
					<h2 className="lg:text-sm xl:text-lg font-extrabold text-[#e61e84]">
						Reservation Details
					</h2>
					{selectedReservation.map((reservation, index) => (
						<div key={index}>
							<p>
								<span className="font-bold lg:text-sm xl:text-[16px] text-[#e61e84]">
									Company:
								</span>{" "}
								<span className="lg:text-sm xl:text-[16px]">
									{reservation.company}
								</span>
							</p>
							<p>
								<span className="font-bold lg:text-sm xl:text-[16px] text-[#e61e84]">
									Department:
								</span>{" "}
								<span className="lg:text-sm xl:text-[16px]">
									{reservation.department}
								</span>
							</p>
							<p>
								<span className="font-bold lg:text-sm xl:text-[16px] text-[#e61e84]">
									Name:
								</span>{" "}
								<span className="lg:text-sm xl:text-[16px]">
									{reservation.name}
								</span>
							</p>
							<p>
								<span className="font-bold lg:text-sm xl:text-[16px] text-[#e61e84]">
									Room:
								</span>{" "}
								<span className="lg:text-sm xl:text-[16px]">
									{reservation.title}
								</span>
							</p>
							<p>
								<span className="font-bold lg:text-sm xl:text-[16px] text-[#e61e84]">
									From:
								</span>{" "}
								<span className="lg:text-sm xl:text-[16px]">
									{new Date(reservation.fromDate).toLocaleString()}
								</span>
							</p>
							<p>
								<span className="font-bold lg:text-sm xl:text-[16px] text-[#e61e84]">
									To:
								</span>{" "}
								<span className="lg:text-sm xl:text-[16px]">
									{new Date(reservation.toDate).toLocaleTimeString()}
								</span>
							</p>
							<p>
								<span className="font-bold lg:text-sm xl:text-[16px] text-[#e61e84]">
									Status:
								</span>{" "}
								<span
									className={`lg:text-sm xl:text-[16px] rounded-full px-2 py-[1px] text-white ${
										reservation.status === "Accepted"
											? "bg-green-600"
											: reservation.status === "Declined"
											? "bg-red-600 "
											: "bg-yellow-500"
									}`}
								>
									{reservation.status || "Pending"}
								</span>
							</p>

							<hr className="my-4" />
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Calendar;
