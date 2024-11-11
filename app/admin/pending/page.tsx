// pages/admin/pending.tsx
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
	description: any;
	processedBy: string;
}

type SortColumn = keyof Reservation;

const PendingPage = () => {
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [reservationsPerPage, setReservationsPerPage] = useState(10);
	const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [selectedReservation, setSelectedReservation] =
		useState<Reservation | null>(null);
	const [acceptModalIsOpen, setAcceptModalIsOpen] = useState(false);
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

	// Fetch accepted reservations from the API
	const fetchAcceptedReservations = async () => {
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
				console.error(
					"Failed to fetch accepted reservations:",
					response.statusText
				);
				return [];
			}
		} catch (error) {
			console.error("Error fetching accepted reservations:", error);
			return [];
		}
	};

	const handleAccept = async (
		id: string,
		email: string,
		processedBy: string
	) => {
		try {
			// Fetch accepted reservations to compare dates
			const acceptedReservations = await fetchAcceptedReservations();

			// Find the reservation to be accepted
			const selectedReservation = reservations.find(
				(reservation) => reservation._id === id
			);

			if (!selectedReservation) {
				throw new Error("Reservation not found");
			}

			// Check for conflicts
			const hasConflict = acceptedReservations.some(
				(reservation: any) =>
					reservation.title === selectedReservation.title &&
					isConflict(reservation, selectedReservation)
			);

			if (hasConflict) {
				toast.error("This room is already booked.");
				return;
			}

			// Send notification email first
			const emailResponse = await fetch("/api/sendEmail/adminEmail", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					subject: "Reservation Accepted",
					updatedReservation: {
						...selectedReservation,
						processedBy,
					},
					status: "Accepted",
				}),
			});

			if (!emailResponse.ok) {
				throw new Error("Failed to send email");
			}

			// Email sent successfully, proceed to update reservation status in database
			const response = await fetch(`/api/reservationDB?status=Pending`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id, status: "Accepted", processedBy }),
			});

			if (!response.ok) {
				throw new Error("Failed to accept reservation");
			}

			setReservations((prevReservations) =>
				prevReservations.map((reservation) =>
					reservation._id === id
						? { ...reservation, status: "Accepted", processedBy }
						: reservation
				)
			);

			toast.success("Reservation accepted successfully!");

			// Reload the page after 5 seconds to reflect changes
			setTimeout(() => {
				window.location.reload();
			}, 5000);
		} catch (error) {
			console.error("Error accepting reservation:", error);
			toast.error("Failed to accept reservation.");
		}
	};

	const handleDecline = async (
		id: string,
		email: string,
		processedBy: string
	) => {
		try {
			// Find the reservation to be declined
			const updatedReservation = reservations.find(
				(reservation) => reservation._id === id
			);

			if (!updatedReservation) {
				throw new Error("Reservation not found");
			}

			// Send notification email first
			const emailResponse = await fetch("/api/sendEmail/adminEmail", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					subject: "Reservation Declined",
					updatedReservation: {
						...updatedReservation,
						processedBy,
					},
					status: "Declined",
				}),
			});

			if (!emailResponse.ok) {
				throw new Error("Failed to send email");
			}

			// Email sent successfully, proceed to update reservation status in database
			const response = await fetch(`/api/reservationDB/`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id, status: "Declined", processedBy }),
			});

			if (!response.ok) {
				throw new Error("Failed to decline reservation");
			}

			setReservations((prevReservations) =>
				prevReservations.map((reservation) =>
					reservation._id === id
						? { ...reservation, status: "Declined", processedBy }
						: reservation
				)
			);

			toast.success("Reservation declined successfully!");

			// Reload the page after 5 seconds to reflect changes
			setTimeout(() => {
				window.location.reload();
			}, 5000);
		} catch (error) {
			console.error("Error declining reservation:", error);
			toast.error("Failed to decline reservation.");
		}
	};

	const openAcceptModal = (reservation: Reservation) => {
		setSelectedReservation(reservation);
		setAcceptModalIsOpen(true);
	};

	const closeAcceptModal = () => {
		setSelectedReservation(null);
		setAcceptModalIsOpen(false);
	};

	const confirmAccept = () => {
		if (selectedReservation) {
			handleAccept(
				selectedReservation._id,
				selectedReservation.email,
				processedBy
			);
		}
		closeAcceptModal();
	};

	const openModal = (reservation: Reservation) => {
		setSelectedReservation(reservation);
		setProcessedBy(reservation.processedBy || "");
		setModalIsOpen(true);
	};

	const closeModal = () => {
		setSelectedReservation(null);
		setProcessedBy("");
		setModalIsOpen(false);
	};

	const confirmDecline = () => {
		if (selectedReservation) {
			handleDecline(
				selectedReservation._id,
				selectedReservation.email,
				processedBy
			);
		}
		closeModal();
	};
	// This is responsible for every latest data should be at the first row of the table
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

	const isConflict = (
		acceptedReservation: Reservation,
		pendingReservation: Reservation | null
	) => {
		if (!pendingReservation) return false;
		const acceptedFromDate = new Date(acceptedReservation.fromDate);
		const acceptedToDate = new Date(acceptedReservation.toDate);
		const pendingFromDate = new Date(pendingReservation.fromDate);
		const pendingToDate = new Date(pendingReservation.toDate);

		// Check if the pending reservation overlaps with the accepted reservation
		const overlaps =
			(pendingFromDate >= acceptedFromDate &&
				pendingFromDate < acceptedToDate) ||
			(pendingToDate > acceptedFromDate && pendingToDate <= acceptedToDate) ||
			(pendingFromDate <= acceptedFromDate && pendingToDate >= acceptedToDate);

		return overlaps;
	};

	return (
		<div className="flex">
			<ToastContainer autoClose={5000} />
			<Sidebar /> {/* Use the Sidebar component */}
			<div className="flex-1 lg:p-4 lg:pl-6 lg:pt-10 2xl:p-8 bg-gray-100 min-h-screen mt-20 lg:mt-0">
				<div className="pb-4 lg:pb-6 2xl:pb-8">
					<h1 className=" text-[1.5rem] md:text-[2rem] text-center lg:text-start lg:text-4xl 2xl:text-5xl font-extrabold text-[#3f3f3f]">
						Pending Records
					</h1>
				</div>
				<div className="p-2 lg:p-0 w-[20rem] md:w-[40rem] lg:w-full max-w-8xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
					<div className="flex justify-end p-1 lg:p-0 2xl:p-3 items-center text-xs xl:text-lg">
						<label
							htmlFor="perPage"
							className="mr-2 text-gray-600 text-xs lg:text-[14px] 2xl:text-[16px] pl-2"
						>
							Per Page:
						</label>
						<select
							id="perPage"
							className="bg-white border border-gray-300 rounded-md text-xs lg:text-[14px] 2xl:text-[16px] pl-2"
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
											className="sticky top-0 px-2 lg:px-0 lg:pl-4 2xl:pl-8 lg:py-2 text-left text-sm lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap lg:pr-4 2xl:pr-0 "
											onClick={() => sortTable("company")}
										>
											Company{" "}
											{sortColumn === "company" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th
											className="sticky top-0 px-2 lg:px-0 lg:py-2 text-left text-sm lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer whitespace-nowrap lg:pr-4 2xl:pr-0 "
											onClick={() => sortTable("department")}
										>
											Department{" "}
											{sortColumn === "department" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th
											className="sticky top-0 px-2 lg:px-0 lg:py-2 text-left text-sm lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer  "
											onClick={() => sortTable("name")}
										>
											Name{" "}
											{sortColumn === "name" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th
											className="sticky top-0 px-2 lg:px-0 lg:py-2 text-left text-sm lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer  "
											onClick={() => sortTable("title")}
										>
											Room{" "}
											{sortColumn === "title" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th
											className="sticky top-0 px-2 lg:px-0 lg:pl-12 2xl:pl-12 lg:py-2 text-left text-sm lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider cursor-pointer  "
											onClick={() => sortTable("fromDate")}
										>
											From{" "}
											{sortColumn === "fromDate" && (
												<span>{sortOrder === "asc" ? "▲" : "▼"}</span>
											)}
										</th>
										<th className="sticky top-0 px-2 lg:px-0 lg:pl-5 2xl:pl-16 lg:py-2 text-left text-sm lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider ">
											To{" "}
										</th>
										<th className="sticky top-0 px-2 lg:px-0 lg:py-2 text-left text-sm lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider ">
											Status
										</th>
										<th className="sticky top-0 px-2 lg:px-0 lg:pl-10 2xl:pl-16 lg:py-2 text-left text-sm lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider ">
											Action
										</th>
										<th className="sticky top-0 px-2 lg:px-0 lg:py-2 lg:pr-4 2xl:pr-0 text-left text-sm lg:text-[12px] 2xl:text-[14px] font-extrabold text-white uppercase tracking-wider ">
											Description
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{currentReservations.map((reservation) => (
										<tr key={reservation._id}>
											<td className=" lg:pl-4 2xl:pl-8 lg:py-2 lg:w-[240px] 2xl:w-[240px] whitespace-nowrap lg:px-4 2xl:px-0 text-xs lg:text-[14px] 2xl:text-[16px] pl-2">
												{reservation.company ===
												"Mixexpert Trading Services and Inc."
													? "MTSI"
													: reservation.company}
											</td>
											<td className=" lg:py-2 lg:w-[250px] 2xl:w-[180px] lg:text-[14px] lg:pr-4 2xl:px-0 whitespace-nowrap text-xs 2xl:text-[16px] pl-2 ">
												{reservation.department}
											</td>
											<td className=" lg:py-2 lg:w-[250px] 2xl:w-[220px] 2xl:pr-4 lg:pr-4 2xl:px-0 whitespace-nowrap text-xs lg:text-[14px] 2xl:text-[16px] pl-2 ">
												{reservation.name}
											</td>
											<td className=" lg:py-2 lg:text-[14px] lg:w-[120px] lg:pr-4 2xl:px-0 2xl:w-[120px] text-xs 2xl:text-[16px] pl-2 ">
												{reservation.title}
											</td>
											<td className=" lg:py-2 lg:w-[240px] 2xl:w-[120px] lg:pr-4 2xl:px-0 whitespace-nowrap text-xs lg:text-[14px] 2xl:text-[16px] pl-2 ">
												{new Date(reservation.fromDate).toLocaleString()}
											</td>
											<td className=" lg:py-2 lg:w-[240px] 2xl:w-[180px] lg:pr-4 2xl:px-0 whitespace-nowrap text-xs lg:text-[14px] 2xl:text-[16px] pl-2 2xl:pl-12">
												{format(
													new Date(reservation.toDate).toLocaleString(),
													"hh:mm aa"
												)}
											</td>
											<td className=" lg:py-2 lg:w-[140px] 2xl:w-[120px] lg:pr-6 2xl:px-0 text-xs lg:text-[14px] 2xl:text-[16px] pl-2">
												{reservation.status === "Accepted" ||
												reservation.status === "Declined"
													? reservation.status
													: "Pending"}
											</td>
											<td className=" lg:py-2 whitespace-nowrap text-xs lg:text-[14px] 2xl:text-[16px] pl-2 ">
												<button
													className="bg-green-500 hover:bg-green-700 text-white font-bold px-1 py-1 lg:px-2 2xl:py-2 2xl:px-4 rounded mr-2"
													onClick={() => openAcceptModal(reservation)}
												>
													Accept
												</button>
												<button
													className="bg-red-500 hover:bg-red-700 text-white font-bold px-1 py-1 lg:px-2 2xl:py-2 2xl:px-4 rounded"
													onClick={() => openModal(reservation)}
												>
													Decline
												</button>
											</td>
											<td className=" pl-14 lg:py-2 lg:pl-10 2xl:pl-12">
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
			{selectedReservation && (
				<ConfirmationModal
					isOpen={modalIsOpen}
					onRequestClose={closeModal}
					onConfirm={confirmDecline}
					title="Confirm Decline"
					message="Are you sure you want to decline this reservation?"
					processedBy={processedBy}
					onProcessedByChange={setProcessedBy}
					isAdmin={true}
				/>
			)}
			{selectedReservation && (
				<ConfirmationModal
					isOpen={acceptModalIsOpen}
					onRequestClose={closeAcceptModal}
					onConfirm={confirmAccept}
					title="Confirm Accept"
					message="Are you sure you want to accept this reservation?"
					processedBy={processedBy}
					onProcessedByChange={setProcessedBy}
					isAdmin={true}
				/>
			)}
		</div>
	);
};

export default PendingPage;
