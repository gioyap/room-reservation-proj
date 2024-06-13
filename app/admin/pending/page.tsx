// pages/admin/pending.tsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/Sidebar"; // Ensure you have this Sidebar component
import Pagination from "@/components/Pagination";
import useReservations from "@/hooks/useReservations";

interface Reservation {
	_id: string;
	company: string;
	department: string;
	name: string;
	title: string;
	fromDate: string;
	toDate: string;
	status: string;
	email: string;
}

type SortColumn = keyof Reservation;

const PendingPage = () => {
	const socketReservations = useReservations();
	const { data: session, status } = useSession();
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [reservationsPerPage, setReservationsPerPage] = useState(10);
	const [sortColumn, setSortColumn] = useState<SortColumn>("department");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

	// Sorting function
	const sortTable = (column: SortColumn) => {
		let newSortOrder: "asc" | "desc" = "asc";
		if (column === sortColumn) {
			newSortOrder = sortOrder === "asc" ? "desc" : "asc";
		}
		setSortColumn(column);
		setSortOrder(newSortOrder);
	};

	// Sorting logic to apply to reservations
	let sortedReservations = [...reservations];
	if (sortColumn && sortOrder) {
		sortedReservations = sortedReservations.sort((a, b) => {
			// Compare function based on the sort column
			let comparison = 0;
			const valueA = a[sortColumn];
			const valueB = b[sortColumn];

			if (valueA > valueB) {
				comparison = 1;
			} else if (valueA < valueB) {
				comparison = -1;
			}

			// Flip the comparison if sorting order is descending
			return sortOrder === "asc" ? comparison : -comparison;
		});
	}

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

	// Update reservations state with data from socket
	useEffect(() => {
		if (socketReservations.length > 0) {
			setReservations(socketReservations);
		}
	}, [socketReservations]);

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

			if (!updatedReservation) {
				throw new Error("Reservation not found");
			}

			setReservations((prevReservations) =>
				prevReservations.map((reservation) =>
					reservation._id === id
						? { ...reservation, status: "Accepted" }
						: reservation
				)
			);

			toast.success("Reservation accepted successfully!");

			// Send notification email
			const emailResponse = await fetch("/api/sendEmail/adminEmail", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					subject: "Reservation Accepted",
					updatedReservation,
					status: "Accepted",
				}),
			});

			if (emailResponse.ok) {
				toast.success("Email sent successfully");
			} else {
				const errorData = await emailResponse.json();
				console.error("Email error:", errorData);
				toast.error("Failed to send email");
			}
			setTimeout(() => {
				window.location.reload();
			}, 5000);
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

			if (!updatedReservation) {
				throw new Error("Reservation not found");
			}

			setReservations((prevReservations) =>
				prevReservations.map((reservation) =>
					reservation._id === id
						? { ...reservation, status: "Declined" }
						: reservation
				)
			);

			toast.success("Reservation declined successfully!");

			// Send notification email
			const emailResponse = await fetch("/api/sendEmail/adminEmail", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					subject: "Reservation Declined",
					updatedReservation,
					status: "Declined",
				}),
			});

			if (emailResponse.ok) {
				toast.success("Email sent successfully");
			} else {
				const errorData = await emailResponse.json();
				console.error("Email error:", errorData);
				toast.error("Failed to send email");
			}
			setTimeout(() => {
				window.location.reload();
			}, 5000);
		} catch (error) {
			console.error("Error declining reservation:", error);
			toast.error("Failed to decline reservation.");
		}
	};

	const indexOfLastReservation = currentPage * reservationsPerPage;
	const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
	const currentReservations = sortedReservations.slice(
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
			<div className="flex-1 lg:p-4 xl:p-8 bg-gray-100 min-h-screen">
				<div className=" lg:pb-2 xl:pb-6">
					<h1 className=" lg:text-2xl 2xl:text-4xl font-extrabold text-[#e81e83]">
						Pending Records
					</h1>
				</div>
				<div className="w-full max-w-8xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
					<div className="flex justify-end lg:p-0 2xl:p-3 items-center">
						<label
							htmlFor="perPage"
							className="mr-2 text-gray-600 lg:text-[14px] 2xl:text-[16px]"
						>
							Per Page:
						</label>
						<select
							id="perPage"
							className="bg-white border border-gray-300 rounded-md lg:text-[14px] 2xl:text-[16px]"
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
								<th
									className="lg:pl-4 2xl:pl-8 lg:py-1 2xl:py-3 text-left lg:text-[10px] 2xl:text-[12px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
									onClick={() => sortTable("company")}
								>
									Company{" "}
									{sortColumn === "company" && (
										<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
									)}
								</th>
								<th
									className="lg:pl-4 2xl:pl-8 lg:py-1 2xl:py-3 text-left lg:text-[10px] 2xl:text-[12px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
									onClick={() => sortTable("department")}
								>
									Department{" "}
									{sortColumn === "department" && (
										<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
									)}
								</th>
								<th
									className="lg:pl-4 2xl:pl-8 lg:py-1 2xl:py-3 text-left lg:text-[10px] 2xl:text-[12px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
									onClick={() => sortTable("name")}
								>
									Name{" "}
									{sortColumn === "name" && (
										<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
									)}
								</th>
								<th
									className="lg:pl-4 2xl:pl-8 lg:py-1 2xl:py-3 text-left lg:text-[10px] 2xl:text-[12px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
									onClick={() => sortTable("title")}
								>
									Room{" "}
									{sortColumn === "title" && (
										<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
									)}
								</th>
								<th
									className="lg:pl-4 2xl:pl-8 lg:py-1 2xl:py-3 text-left lg:text-[10px] 2xl:text-[12px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
									onClick={() => sortTable("fromDate")}
								>
									From{" "}
									{sortColumn === "fromDate" && (
										<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
									)}
								</th>
								<th
									className="lg:pl-4 2xl:pl-8 lg:py-1 2xl:py-3 text-left lg:text-[10px] 2xl:text-[12px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
									onClick={() => sortTable("toDate")}
								>
									To{" "}
									{sortColumn === "toDate" && (
										<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
									)}
								</th>
								<th className="lg:pl-4 2xl:pl-8 lg:py-1 2xl:py-3 text-left lg:text-[10px] 2xl:text-[12px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap">
									Status
								</th>
								<th className="lg:pl-4 2xl:pl-8 lg:py-1 2xl:py-3 text-left lg:text-[10px] 2xl:text-[12px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap">
									Action
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{currentReservations.map((reservation) => (
								<tr key={reservation._id}>
									<td className="lg:px-4 2xl:px-8 lg:py-1 2xl:py-3 whitespace-nowrap lg:text-[14px] 2xl:text-[16px]">
										{reservation.company}
									</td>
									<td className="lg:px-4 2xl:px-8 lg:py-1 2xl:py-3 whitespace-nowrap lg:text-[14px] 2xl:text-[16px]">
										{reservation.department}
									</td>
									<td className="lg:px-4 2xl:px-8 lg:py-1 2xl:py-3 whitespace-nowrap lg:text-[14px] 2xl:text-[16px]">
										{reservation.name}
									</td>
									<td className="lg:px-4 2xl:px-8 lg:py-1 2xl:py-3 whitespace-nowrap lg:text-[14px] 2xl:text-[16px]">
										{reservation.title}
									</td>
									<td className="lg:px-4 2xl:px-8 lg:py-1 2xl:py-3 whitespace-nowrap lg:text-[14px] 2xl:text-[16px]">
										{new Date(reservation.fromDate).toLocaleString()}
									</td>
									<td className="lg:px-4 2xl:px-8 lg:py-1 2xl:py-3 whitespace-nowrap lg:text-[14px] 2xl:text-[16px]">
										{new Date(reservation.toDate).toLocaleString()}
									</td>
									<td className="lg:px-4 2xl:px-8 lg:py-1 2xl:py-3 whitespace-nowrap lg:text-[14px] 2xl:text-[16px]">
										{reservation.status === "Accepted" ||
										reservation.status === "Declined"
											? reservation.status
											: "Pending"}
									</td>
									<td className="lg:px-4 2xl:px-8 lg:py-1 2xl:py-3 whitespace-nowrap lg:text-[14px] 2xl:text-[16px]">
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
				<Pagination
					reservations={reservations}
					reservationsPerPage={reservationsPerPage}
					currentPage={currentPage}
					paginate={paginate}
				/>
			</div>
		</div>
	);
};

export default PendingPage;
