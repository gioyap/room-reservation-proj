// pages/admin/accepted.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/Sidebar"; // Ensure you have this Sidebar component

interface Reservation {
	_id: string;
	department: string;
	name: string;
	title: string;
	fromDate: string;
	toDate: string;
	status: string;
	email: string;
}

const PendingPage = () => {
	const { data: session, status } = useSession();
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [reservationsPerPage, setReservationsPerPage] = useState(10);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/api/status/pending"); // Adjust your API endpoint accordingly
				const data = await response.json();
				setReservations(data.reservations);
			} catch (error) {
				console.error("Error fetching reservations:", error);
			} finally {
				setLoading(false);
			}
		};

		if (session && session.user.isAdmin) {
			fetchData();
		}
	}, [session]);

	const handleAccept = async (id: string, email: string) => {
		try {
			const response = await fetch(`/api/reservationDB?status=Pending`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id, status: "Accepted" }),
			});

			if (!response.ok) {
				throw new Error("Failed to accept reservation");
			}

			const updatedReservation = reservations.find(
				(reservation) => reservation._id === id
			);

			setReservations((prevReservations) =>
				prevReservations.map((reservation) =>
					reservation._id === id
						? { ...reservation, status: "Accepted" }
						: reservation
				)
			);

			toast.success("Reservation accepted successfully!");

			if (!updatedReservation) {
				throw new Error("Reservation not found");
			}

			// Send notification email
			const emailResponse = await fetch("/api/sendEmail", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					subject: "Reservation Accepted",
					message: `
						Your reservation has been accepted.
						Department: ${updatedReservation.department}
						Name: ${updatedReservation.name}
						Room: ${updatedReservation.title}
						From: ${new Date(updatedReservation.fromDate).toLocaleString()}
						To: ${new Date(updatedReservation.toDate).toLocaleString()}
					`,
				}),
			});

			if (emailResponse.ok) {
				toast.success("Email sent successfully");
			} else {
				toast.error("Failed to send email");
			}
		} catch (error) {
			console.error("Error accepting reservation:", error);
			toast.error("Failed to accept reservation.");
		}
	};

	const handleDecline = async (id: string, email: string) => {
		try {
			const response = await fetch(`/api/reservationDB/`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id, status: "Declined" }),
			});

			if (!response.ok) {
				throw new Error("Failed to decline reservation");
			}

			const updatedReservation = reservations.find(
				(reservation) => reservation._id === id
			);

			setReservations((prevReservations) =>
				prevReservations.map((reservation) =>
					reservation._id === id
						? { ...reservation, status: "Declined" }
						: reservation
				)
			);

			toast.success("Reservation declined successfully!");

			if (!updatedReservation) {
				throw new Error("Reservation not found");
			}

			// Send notification email
			const emailResponse = await fetch("/api/sendEmail", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					subject: "Reservation Declined",
					message: `
						Your reservation has been declined.
						Department: ${updatedReservation.department}
						Name: ${updatedReservation.name}
						Room: ${updatedReservation.title}
						From: ${new Date(updatedReservation.fromDate).toLocaleString()}
						To: ${new Date(updatedReservation.toDate).toLocaleString()}
					`,
				}),
			});

			if (emailResponse.ok) {
				toast.success("Email sent successfully");
			} else {
				toast.error("Failed to send email");
			}
		} catch (error) {
			console.error("Error declining reservation:", error);
			toast.error("Failed to decline reservation.");
		}
	};

	const indexOfLastReservation = currentPage * reservationsPerPage;
	const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
	const currentReservations = reservations.slice(
		indexOfFirstReservation,
		indexOfLastReservation
	);

	const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

	if (loading) {
		return (
			<p className="text-center text-gray-500 mt-20 text-xl">Loading...</p>
		);
	}

	return (
		<div className="flex">
			<ToastContainer autoClose={4000} />
			<Sidebar /> {/* Use the Sidebar component */}
			<div className="flex-1 p-8 bg-gray-100 min-h-screen">
				<div className=" pb-6">
					<h1 className=" text-4xl font-extrabold text-[#e81e83]">
						Pending Records
					</h1>
				</div>
				<div className="w-full max-w-8xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
					<div className="flex justify-end p-3">
						<label htmlFor="perPage" className="mr-2 text-gray-600">
							Per Page:
						</label>
						<select
							id="perPage"
							className="bg-white border border-gray-300 rounded-md"
							value={reservationsPerPage}
							onChange={(e) => setReservationsPerPage(parseInt(e.target.value))}
						>
							<option value={5}>5</option>
							<option value={10}>10</option>
							<option value={15}>15</option>
							<option value={20}>20</option>
						</select>
					</div>
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-[#e81e83]">
							<tr>
								<th className="pl-8 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
									Department
								</th>
								<th className="pl-8 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
									Name
								</th>
								<th className="pl-8 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
									Room
								</th>
								<th className="pl-8 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
									Start Date
								</th>
								<th className="pl-8 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
									Duration (hours)
								</th>
								<th className="pl-8 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
									Duration (minutes)
								</th>
								<th className="pl-8 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
									Status
								</th>
								<th className="pl-24 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">
									Action
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{currentReservations.map((reservation) => (
								<tr key={reservation._id}>
									<td className="px-8 py-3 whitespace-nowrap">
										{reservation.department}
									</td>
									<td className="px-8 py-3 whitespace-nowrap">
										{reservation.name}
									</td>
									<td className="px-8 py-3 whitespace-nowrap">
										{reservation.title}
									</td>
									<td className="px-8 py-3 whitespace-nowrap">
										{new Date(reservation.fromDate).toLocaleString()}
									</td>
									<td className="px-8 py-3 whitespace-nowrap">
										{new Date(reservation.toDate).toLocaleString()}
									</td>
									<td className="px-8 py-3 whitespace-nowrap">
										{reservation.status === "Accepted" ||
										reservation.status === "Declined"
											? reservation.status
											: "Pending"}
									</td>
									<td className="px-8 py-3 whitespace-nowrap">
										<button
											className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
											onClick={() =>
												handleAccept(reservation._id, reservation.email)
											}
										>
											Accept
										</button>
										<button
											className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
											onClick={() =>
												handleDecline(reservation._id, reservation.email)
											}
										>
											Decline
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="flex justify-center mt-4">
					<nav>
						<ul className="flex pl-0 rounded list-none flex-wrap">
							{Array.from({
								length: Math.ceil(reservations.length / reservationsPerPage),
							}).map((_, index) => (
								<li
									key={index}
									className="first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 justify-center items-center cursor-pointer leading-tight relative border rounded-full bg-white text-gray-800 border-gray-300 hover:bg-gray-200"
									onClick={() => paginate(index + 1)}
								>
									{index + 1}
								</li>
							))}
						</ul>
					</nav>
				</div>
			</div>
		</div>
	);
};

export default PendingPage;
