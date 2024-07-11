// pages/admin/pending.tsx
"use client";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../../components/Sidebar";
import Pagination from "../../../components/Pagination";
import { format } from "date-fns";

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
	description: any;
}

type SortColumn = keyof Reservation;

const PendingPage = () => {
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [reservationsPerPage, setReservationsPerPage] = useState(10);
	const [sortColumn, setSortColumn] = useState<SortColumn>("department");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

	useEffect(() => {
		fetchBookedDates().then((data) => {
			setReservations(data);
		});
	}, []);

	// Fetch booked dates from the API
	const fetchBookedDates = async () => {
		try {
			const response = await fetch("/api/status/pending");
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
				console.error("Failed to fetch reservations:", response.statusText);
				return [];
			}
		} catch (error) {
			console.error("Error fetching reservations:", error);
			return [];
		} finally {
			setLoading(false); // Set loading state to false regardless of success or failure
		}
	};

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
			<p className="text-center text-[#e81e83] font-extrabold text-4xl mt-20">
				Loading...
			</p>
		);
	}

	return (
		<div className="flex">
			<ToastContainer autoClose={4000} />
			<Sidebar /> {/* Use the Sidebar component */}
			<div className="flex-1 lg:p-4 lg:pl-6 lg:pt-10 2xl:p-8 bg-gray-100 min-h-screen">
				<div className=" lg:pb-6 2xl:pb-8">
					<h1 className=" lg:text-4xl 2xl:text-5xl font-extrabold text-[#e81e83]">
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
					<div className="overflow-x-auto">
						<div
							className={
								reservationsPerPage === 15 || reservationsPerPage === 20
									? "h-[608px] overflow-y-auto"
									: ""
							}
						>
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-[#e81e83]">
									<tr>
										<th
											className="sticky top-0 lg:pl-4 2xl:pl-8 lg:py-2 text-left lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap lg:pr-4 2xl:pr-0 "
											onClick={() => sortTable("company")}
										>
											Company{" "}
											{sortColumn === "company" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th
											className="sticky top-0 lg:py-2 text-left lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap lg:pr-4 2xl:pr-0 "
											onClick={() => sortTable("department")}
										>
											Department{" "}
											{sortColumn === "department" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th
											className="sticky top-0 lg:py-2 text-left lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer  "
											onClick={() => sortTable("name")}
										>
											Name{" "}
											{sortColumn === "name" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th
											className="sticky top-0 lg:py-2 text-left lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer  "
											onClick={() => sortTable("title")}
										>
											Room{" "}
											{sortColumn === "title" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th
											className="sticky top-0 lg:pl-12 2xl:pl-12 lg:py-2 text-left lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer  "
											onClick={() => sortTable("fromDate")}
										>
											From{" "}
											{sortColumn === "fromDate" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th className="sticky top-0 lg:pl-5 2xl:pl-16 lg:py-2 text-left lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider ">
											To{" "}
										</th>
										<th className="sticky top-0 lg:py-2 text-left lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider ">
											Status
										</th>
										<th className="sticky top-0 lg:pl-10 2xl:pl-16 lg:py-2 text-left lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider ">
											Action
										</th>
										<th className="sticky top-0 lg:py-2 lg:pr-4 2xl:pr-0 text-left lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider ">
											Description
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{currentReservations.map((reservation) => (
										<tr key={reservation._id}>
											<td className=" lg:pl-4 2xl:pl-8 lg:py-2 lg:w-[240px] 2xl:w-[240px] whitespace-nowrap lg:px-4 2xl:px-0 lg:text-[14px] 2xl:text-[16px]">
												{reservation.company}
											</td>
											<td className=" lg:py-2 lg:w-[250px] 2xl:w-[180px] lg:text-[14px] lg:pr-4 2xl:px-0 whitespace-nowrap 2xl:text-[16px] ">
												{reservation.department}
											</td>
											<td className=" lg:py-2 lg:w-[250px] 2xl:w-[220px] 2xl:pr-4 lg:pr-4 2xl:px-0 whitespace-nowrap lg:text-[14px] 2xl:text-[16px] ">
												{reservation.name}
											</td>
											<td className=" lg:py-2 lg:text-[14px] lg:w-[120px] lg:pr-4 2xl:px-0 2xl:w-[120px] 2xl:text-[16px] ">
												{reservation.title}
											</td>
											<td className=" lg:py-2 lg:w-[240px] 2xl:w-[120px] lg:pr-4 2xl:px-0 whitespace-nowrap lg:text-[14px] 2xl:text-[16px] ">
												{new Date(reservation.fromDate).toLocaleString()}
											</td>
											<td className=" lg:py-2 lg:w-[240px] 2xl:w-[180px] lg:pr-4 2xl:px-0 whitespace-nowrap lg:text-[14px] 2xl:text-[16px] 2xl:pl-12">
												{format(
													new Date(reservation.toDate).toLocaleString(),
													"hh:mm aa"
												)}
											</td>
											<td className=" lg:py-2 lg:w-[140px] 2xl:w-[120px] lg:pr-6 2xl:px-0 lg:text-[14px] 2xl:text-[16px]">
												{reservation.status === "Accepted" ||
												reservation.status === "Declined"
													? reservation.status
													: "Pending"}
											</td>
											<td className=" lg:py-2 whitespace-nowrap lg:text-[14px] 2xl:text-[16px] ">
												<button
													className="bg-green-500 hover:bg-green-700 text-white font-bold lg:py-1 lg:px-2 2xl:py-2 2xl:px-4 rounded mr-2"
													onClick={() =>
														handleAccept(reservation._id, reservation.email)
													}
												>
													Accept
												</button>
												<button
													className="bg-red-500 hover:bg-red-700 text-white font-bold lg:py-1 lg:px-2 2xl:py-2 2xl:px-4 rounded"
													onClick={() =>
														handleDecline(reservation._id, reservation.email)
													}
												>
													Decline
												</button>
											</td>
											<td className=" lg:py-2 lg:pl-10 2xl:pl-12">
												{reservation.description ? (
													<input type="checkbox" checked={true} readOnly />
												) : (
													<input type="checkbox" checked={false} readOnly />
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
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
