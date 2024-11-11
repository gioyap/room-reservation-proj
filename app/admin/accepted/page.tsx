"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../../components/Sidebar";
import Pagination from "../../../components/Pagination";
import { format } from "date-fns";
import ConfirmationModal from "../../../components/ConfirmationModal";

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
	processedBy: string;
}

type SortColumn = keyof Reservation;

const AcceptedPage = () => {
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [reservationsPerPage, setReservationsPerPage] = useState(10);
	const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [selectedReservation, setSelectedReservation] =
		useState<Reservation | null>(null);
	const [processedBy, setProcessedBy] = useState<string>("");

	useEffect(() => {
		// The _id is timestamp which responsible for latest data fetching
		fetchBookedDates().then((data) => {
			const sortedReservations = data.sort(
				(a: Reservation, b: Reservation) =>
					new Date(a._id).getTime() - new Date(b._id).getTime()
			);
			setReservations(sortedReservations);
			setLoading(false);
		});
	}, []);

	// Fetch booked dates from the API
	const fetchBookedDates = async () => {
		try {
			const response = await fetch("/api/status/accepted");
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
		let newSortOrder: "asc" | "desc" = "asc"; // Type annotation for newSortOrder
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

	const handleCancel = async (
		id: string,
		email: string,
		processedBy: string
	) => {
		try {
			const updatedReservation = reservations.find(
				(reservation) => reservation._id === id
			);

			if (!updatedReservation) {
				throw new Error("Reservation not found");
			}

			// Send notification email first
			const emailResponse = await fetch("/api/sendEmail/cancelAdmin", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					subject: "Reservation Canceled",
					updatedReservation: {
						...updatedReservation,
						processedBy,
					},
					status: "Accepted",
				}),
			});

			if (!emailResponse.ok) {
				throw new Error("Failed to send email");
			}

			// Email sent successfully, proceed to update reservation status in database
			const response = await fetch(`/api/reservationDB`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id, status: "Pending" }),
			});

			if (!response.ok) {
				throw new Error("Failed to cancel reservation");
			}

			// const data = await fetchBookedDates();

			setReservations((prevReservations) =>
				prevReservations.map((reservation) =>
					reservation._id === id
						? { ...reservation, status: "Pending" } // Adjust status to "Pending" as cancellation
						: reservation
				)
			);

			// setReservations(data);

			toast.success("Reservation Canceled successfully!");

			setTimeout(() => {
				window.location.reload();
			}, 5000);
		} catch (error) {
			console.error("Error handling reservation cancellation:", error);
			toast.error("Failed to cancel reservation.");
		}
	};

	const openModal = (reservation: Reservation) => {
		setSelectedReservation(reservation);
		setModalIsOpen(true);
	};

	const closeModal = () => {
		setSelectedReservation(null);
		setModalIsOpen(false);
	};

	const confirmDecline = () => {
		if (selectedReservation) {
			handleCancel(
				selectedReservation._id,
				selectedReservation.email,
				processedBy
			);
		}
		closeModal();
	};
	//this is responsible for every latest data should be at the first of the table
	const reversedReservations = sortedReservations.reverse();
	const indexOfLastReservation = currentPage * reservationsPerPage;
	const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
	const currentReservations = reversedReservations.slice(
		indexOfFirstReservation,
		indexOfLastReservation
	);

	const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

	if (loading) {
		return (
			<p className="text-center text-[#3f3f3f] font-extrabold text-4xl mt-20">
				Loading...
			</p>
		);
	}

	return (
		<div className="flex">
			<ToastContainer autoClose={4000} />
			<Sidebar /> {/* Use the Sidebar component */}
			<div className="flex-1 lg:p-4 lg:pl-6 lg:pt-10 2xl:p-8 bg-gray-100 min-h-screen mt-20 lg:mt-0">
				<div className="lg:pb-6 2xl:pb-8">
					<h1 className=" text-[1.5rem] md:text-[2rem] lg:text-4xl 2xl:text-5xl font-extrabold text-[#3f3f3f] text-center lg:text-start">
						Accepted Records
					</h1>
				</div>
				<div className=" p-2 w-[20rem] md:w-[40rem] lg:w-full max-w-8xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
					<div className="flex justify-end lg:p-0 2xl:p-3 text-xs p-1">
						<label
							htmlFor="perPage"
							className="mr-2 text-gray-600 lg:text-[14px] 2xl:text-[16px] pl-2 text-xs "
						>
							Per Page:
						</label>
						<select
							id="perPage"
							className="bg-white border border-gray-300 rounded-md lg:text-[14px] 2xl:text-[16px] pl-2 text-xs "
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
								<thead className="bg-[#3f3f3f]">
									<tr>
										<th
											className="sticky text-xs text-center px-2 top-0 lg:pl-4 2xl:pl-8 lg:py-2 lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap lg:pr-4 2xl:pr-0 "
											onClick={() => sortTable("company")}
										>
											Company{" "}
											{sortColumn === "company" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th
											className="sticky text-xs text-center px-2 top-0 lg:py-2 lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap lg:pr-4 2xl:pr-0  "
											onClick={() => sortTable("department")}
										>
											Department{" "}
											{sortColumn === "department" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th
											className="sticky text-xs text-center px-2 top-0 lg:py-2 lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer  "
											onClick={() => sortTable("name")}
										>
											Name{" "}
											{sortColumn === "name" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th
											className="sticky text-xs text-center px-2 top-0 lg:py-2 lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer  "
											onClick={() => sortTable("title")}
										>
											Room{" "}
											{sortColumn === "title" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th
											className="sticky text-xs text-center px-2 top-0 lg:pl-12 2xl:pl-12 lg:py-2 lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer "
											onClick={() => sortTable("fromDate")}
										>
											From{" "}
											{sortColumn === "fromDate" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th className="sticky text-xs text-center px-2 top-0 lg:pl-12 2xl:pl-16 lg:py-2 lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider ">
											To{" "}
										</th>
										<th className="sticky text-xs text-center px-2 top-0 lg:pl-4 lg:py-2 lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider ">
											Status
										</th>
										<th className="sticky text-xs text-center px-2 top-0 lg:pl-4 lg:py-2 lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider ">
											Action
										</th>
										<th className="sticky text-xs text-center px-2 top-0 lg:pl-4 lg:py-2 lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider ">
											Processed By
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{currentReservations.map((reservation) => (
										<tr key={reservation._id}>
											<td className="lg:pl-4 2xl:pl-8 lg:py-2 lg:w-[220px] 2xl:w-[200px] whitespace-nowrap lg:px-4 2xl:px-0 lg:text-[14px] 2xl:text-[16px] pl-2 text-xs text-center ">
												{reservation.company ===
												"Mixexpert Trading Services and Inc."
													? "MTSI"
													: reservation.company}
											</td>
											<td className="lg:py-2 lg:w-[200px] 2xl:w-[150px] lg:text-[14px] lg:pr-4 2xl:px-0 whitespace-nowrap 2xl:text-[16px] pl-2 text-xs text-center  ">
												{reservation.department}
											</td>
											<td className=" lg:py-2 lg:w-[250px] 2xl:w-[200px] 2xl:pr-4 lg:pr-4 2xl:px-0 whitespace-nowrap lg:text-[14px] 2xl:text-[16px] pl-2 text-xs text-center  ">
												{reservation.name}
											</td>
											<td className=" lg:py-2 lg:text-[14px] lg:w-[120px] lg:pr-4 2xl:px-0 2xl:w-[100px] 2xl:text-[16px] pl-2 text-xs text-center  ">
												{reservation.title}
											</td>
											<td className="lg:py-2 lg:w-[140px] 2xl:w-[100px] lg:pr-4 2xl:px-0 whitespace-nowrap lg:text-[14px] 2xl:text-[16px] pl-2 text-xs text-center  ">
												{new Date(reservation.fromDate).toLocaleString()}
											</td>
											<td className=" lg:pl-7 2xl:pl-10 lg:py-2 lg:w-[180px] 2xl:w-[150px] lg:pr-4 2xl:px-0 whitespace-nowrap lg:text-[14px] 2xl:text-[16px] pl-2 text-xs text-center  ">
												{format(
													new Date(reservation.toDate).toLocaleString(),
													"hh:mm aa"
												)}
											</td>
											<td className="lg:py-2 lg:w-[140px] 2xl:w-[150px] lg:pr-6 2xl:px-0 lg:text-[14px] 2xl:text-[16px] pl-2 text-xs text-center ">
												<span className="bg-green-600 rounded-full px-4 py-1 text-white font-bold">
													{reservation.status}
												</span>
											</td>
											<td className="lg:py-2 lg:w-[140px] 2xl:w-[120px] lg:pr-6 2xl:px-0 lg:text-[14px] 2xl:text-[16px] pl-2 text-xs text-center ">
												<button
													className="bg-[#ff7b00] hover:bg-red-700 text-white font-bold py-1 px-6 rounded-full"
													onClick={() => openModal(reservation)}
												>
													Cancel
												</button>
											</td>
											<td className="lg:py-2 lg:w-[140px] 2xl:w-[150px] lg:pr-6 2xl:px-0 lg:text-[14px] 2xl:text-[16px] pl-2 text-xs text-center ">
												{reservation.processedBy}
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
			{selectedReservation && (
				<ConfirmationModal
					isOpen={modalIsOpen}
					onRequestClose={closeModal}
					onConfirm={confirmDecline}
					title="Confirm Cancel"
					message="Are you sure you want to cancel this accepted reservation?"
					processedBy={processedBy}
					onProcessedByChange={setProcessedBy}
					isAdmin={true}
				/>
			)}
		</div>
	);
};

export default AcceptedPage;
