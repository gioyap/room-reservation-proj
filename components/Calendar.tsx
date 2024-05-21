// components/Calendar.tsx

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
} from "date-fns";

interface CalendarProps {
	selectedDate: Date;
	selectedTime: Date;
	onChange: (date: Date) => void;
	onTimeChange: (time: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
	selectedDate,
	onChange,
	onTimeChange,
}) => {
	const monthStart = startOfMonth(selectedDate);
	const monthEnd = endOfMonth(selectedDate);
	const startDate = startOfWeek(monthStart);
	const endDate = endOfWeek(monthEnd);
	const [bookedDates, setBookedDates] = useState<string[]>([]);

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
				// Ensure that data.reservations is an array before attempting to map over it
				if (Array.isArray(data.reservations)) {
					return data.reservations.map(
						(reservation: { startDate: string | number | Date }) =>
							new Date(reservation.startDate)
					);
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
	let day = startDate;
	while (day <= endDate) {
		days.push(day);
		day = addDays(day, 1);
	}

	const [selectedTime, setSelectedTime] = useState<Date>(new Date());

	const handleDayClick = (date: Date) => {
		onChange(date);
	};

	const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		const time = parse(value, "HH:mm", new Date());
		const utcTime =
			startOfDay(selectedDate).getTime() +
			time.getHours() * 3600000 +
			time.getMinutes() * 60000; // Convert time to UTC
		const newSelectedTime = new Date(utcTime);
		setSelectedTime(newSelectedTime);
		onTimeChange(newSelectedTime);
	};

	const isDateBooked = (date: Date) => {
		return bookedDates.some((bookedDate) => {
			// Compare dates without considering time
			return (
				startOfDay(new Date(bookedDate)).getTime() ===
				startOfDay(date).getTime()
			);
		});
	};

	const getDayClassName = (day: Date) => {
		const isBooked = isDateBooked(day);
		return isBooked ? "bg-green-300" : "";
	};

	return (
		<div className="flex gap-x-10 items-start">
			<div className="calendar bg-white p-8 rounded shadow mr-4">
				<div className="header text-center mb-4">
					<span className="text-lg font-semibold">
						{format(selectedDate, "MMMM yyyy")}
					</span>
				</div>
				<div className="grid grid-cols-7 gap-6">
					{days.map((day, index) => (
						<div
							key={index}
							className={`day text-center cursor-pointer py-2 ${
								day.getMonth() !== selectedDate.getMonth()
									? "text-gray-400"
									: ""
							} ${getDayClassName(day)}`}
							onClick={() => handleDayClick(day)}
						>
							{format(day, "d")}
						</div>
					))}
				</div>
			</div>
			<div className="time-table bg-white p-4 rounded shadow">
				<div className="header text-center mb-4">
					<span className="text-lg font-semibold">Select Time</span>
				</div>
				<input
					type="time"
					value={format(selectedTime, "HH:mm")}
					onChange={handleTimeChange}
					className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getDayClassName(
						day
					)}`}
				/>
			</div>
		</div>
	);
};

export default Calendar;
