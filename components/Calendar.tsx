import React, { useState, useEffect } from "react";
import Reservation from "../utils/models/reservation";

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

interface Reservation {
	_id: string;
	department: string;
	name: string;
	title: string;
	startDate: Date;
	duration: {
		hours: number;
		minutes: number;
	};
	status: string;
}

interface CalendarProps {
	selectedDate: Date;
	selectedTime: Date;
	onChange: (date: Date) => void;
	onTimeChange: (time: Date) => void;
	reservations: Reservation[];
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

	const [bookedDates, setBookedDates] = useState<Reservation[]>([]);
	const [selectedReservation, setSelectedReservation] = useState<Reservation[]>(
		[]
	);
	const [selectedTime, setSelectedTime] = useState<Date>(new Date());

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
	let day = startDate;
	while (day <= endDate) {
		days.push(day);
		day = addDays(day, 1);
	}

	const handleDayClick = (date: Date) => {
		onChange(date);
		setSelectedReservation([]);
	};

	const handleBookedDayClick = (reservation: Reservation) => {
		const date = new Date(reservation.startDate);
		onChange(date);

		const reservationsForDate = bookedDates.filter(
			(res) => new Date(res.startDate).toDateString() === date.toDateString()
		);
		setSelectedReservation(reservationsForDate);
	};

	const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		const time = parse(value, "HH:mm", new Date());
		const utcTime =
			startOfDay(selectedDate).getTime() +
			time.getHours() * 3600000 +
			time.getMinutes() * 60000;
		const newSelectedTime = new Date(utcTime);
		setSelectedTime(newSelectedTime);
		onTimeChange(newSelectedTime);
	};

	const isDateBooked = (date: Date) => {
		return bookedDates.some(
			(bookedDate) =>
				new Date(bookedDate.startDate).toDateString() === date.toDateString()
		);
	};

	const getDayClassName = (day: Date) => {
		const isBooked = isDateBooked(day);
		return isBooked ? "booked-day bg-green-300 rounded-lg lg:px-0 xl:px-2" : "";
	};

	return (
		<div className="flex gap-x-4 items-start">
			<div className="calendar bg-white p-8 rounded shadow mr-4">
				<div className="header text-center mb-4">
					<span className="text-lg font-extrabold text-[#e61e84]">
						{format(selectedDate, "MMMM yyyy")}
					</span>
				</div>
				<div className="grid grid-cols-7 lg:gap-2 lg:gap-x-4 xl:gap-6">
					{days.map((day, index) => {
						const reservation = bookedDates.find(
							(res) =>
								new Date(res.startDate).toDateString() === day.toDateString()
						);
						return (
							<div
								key={index}
								className={`day text-center cursor-pointer py-2 ${getDayClassName(
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
							</div>
						);
					})}
				</div>
			</div>
			<div className="time-table bg-white p-4 rounded shadow">
				<div className="header text-center mb-4">
					<span className="text-lg font-extrabold text-[#e61e84]">
						Select Time
					</span>
				</div>
				<input
					type="time"
					value={format(selectedTime, "HH:mm")}
					onChange={handleTimeChange}
					className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			{selectedReservation && selectedReservation.length > 0 && (
				<div
					className={`reservation-details bg-white lg:p-2 xl:p-4 rounded shadow absolute lg:ml-[300px] lg:mt-[150px] xl:ml-[485px] xl:mt-[135px] ${
						selectedReservation.length >= 4 ? "overflow-y-auto max-h-80" : ""
					}`}
				>
					<h2 className="lg:text-sm xl:text-lg font-extrabold text-[#e61e84]">
						Reservation Details
					</h2>
					{selectedReservation.map((reservation, index) => (
						<div key={index}>
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
									Start Date:
								</span>{" "}
								<span className="lg:text-sm xl:text-[16px]">
									{new Date(reservation.startDate).toLocaleString()}
								</span>
							</p>
							<p>
								<span className="font-bold lg:text-sm xl:text-[16px] text-[#e61e84]">
									Duration:
								</span>{" "}
								<span className="lg:text-sm xl:text-[16px]">
									{reservation.duration.hours} hours{" "}
									{reservation.duration.minutes} minutes
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
