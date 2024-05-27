"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Duration {
	hours: number;
	minutes: number;
}

interface Reservation {
	_id: string;
	department: string;
	name: string;
	title: string;
	startDate: string;
	duration: Duration;
	status: string;
}

const AdminDashboard = () => {
	const { data: session } = useSession();
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [reservationsPerPage, setReservationsPerPage] = useState(10);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/api/reservationDB");
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

	const handleAccept = async (id: string) => {
		try {
			const response = await fetch(`/api/reservationDB/`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id, status: "Accepted" }),
			});

			if (!response.ok) {
				throw new Error("Failed to accept reservation");
			}

			setReservations((prevReservations) =>
				prevReservations.map((reservation) =>
					reservation._id === id
						? { ...reservation, status: "Accepted" }
						: reservation
				)
			);
			toast.success("Reservation accepted successfully!");
		} catch (error) {
			console.error("Error accepting reservation:", error);
			toast.error("Failed to accept reservation.");
		}
	};

	const handleDecline = async (id: string) => {
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

			setReservations((prevReservations) =>
				prevReservations.map((reservation) =>
					reservation._id === id
						? { ...reservation, status: "Declined" }
						: reservation
				)
			);
			toast.success("Reservation declined successfully!");
		} catch (error) {
			console.error("Error declining reservation:", error);
			toast.error("Failed to decline reservation.");
		}
	};

	if (!session || !session.user.isAdmin) {
		return (
			<p className="text-center text-red-500 mt-20 text-xl">Access Denied</p>
		);
	}

	if (loading) {
		return (
			<p className="text-center text-gray-500 mt-20 text-xl">Loading...</p>
		);
	}

	const indexOfLastReservation = currentPage * reservationsPerPage;
	const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
	const currentReservations = reservations.slice(
		indexOfFirstReservation,
		indexOfLastReservation
	);

	const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

	return (
		<div className="flex">
			<ToastContainer autoClose={4000} />
			<div className="w-[250px] bg-[#e81e83] h-screen p-3">
				<div className="flex flex-col items-center">
					<button
						onClick={() => signOut()}
						className="bg-[#f93e9e] hover:bg-[#3fa8ee] text-white rounded text-[12px] xl:text-[18px] w-auto p-3 uppercase font-extrabold shadow-lg"
					>
						Logout
					</button>
				</div>
			</div>
			<div className="flex-1 p-8 bg-gray-100 min-h-screen">
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
						<thead className="bg-gray-50">
							<tr>
								<th className="pl-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Department
								</th>
								<th className="pl-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Name
								</th>
								<th className="pl-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Room
								</th>
								<th className="pl-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Start Date
								</th>
								<th className="pl-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Duration (hours)
								</th>
								<th className="pl-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Duration (minutes)
								</th>
								<th className="pl-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="pl-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Accept
								</th>
								<th className="pl-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Decline
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
										{new Date(reservation.startDate).toLocaleString()}
									</td>
									<td className="px-8 py-3 whitespace-nowrap">
										{reservation.duration.hours}
									</td>
									<td className="px-8 py-3 whitespace-nowrap">
										{reservation.duration.minutes}
									</td>
									<td className="px-8 py-3 whitespace-nowrap">
										{reservation.status === "Accepted" ||
										reservation.status === "Declined"
											? reservation.status
											: "Pending"}
									</td>
									<td className="px-8 py-3 whitespace-nowrap">
										<button
											className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded"
											onClick={() => handleAccept(reservation._id)}
										>
											Accept
										</button>
									</td>
									<td className="px-8 py-3 whitespace-nowrap">
										<button
											className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded"
											onClick={() => handleDecline(reservation._id)}
										>
											Decline
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<div className="flex justify-between p-3">
						{/* Pagination Controls */}
						<nav>
							<ul className="inline-flex -space-x-px">
								{Array.from(
									{
										length: Math.ceil(
											reservations.length / reservationsPerPage
										),
									},
									(_, index) => (
										<li key={index}>
											<button
												onClick={() => paginate(index + 1)}
												className={`px-3 py-2 border ${
													currentPage === index + 1 ? "bg-gray-300" : "bg-white"
												}`}
											>
												{index + 1}
											</button>
										</li>
									)
								)}
							</ul>
						</nav>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
