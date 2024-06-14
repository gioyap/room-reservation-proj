import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Reservation } from "@/types/type";

const socketUrl =
	process.env.NODE_ENV === "development"
		? "http://localhost:4000" // Use the port your Express server is listening on
		: "https://reservation-system-nu.vercel.app"; // Adjust to your production WebSocket server

const useReservations = () => {
	const [reservations, setReservations] = useState<Reservation[]>([]);

	useEffect(() => {
		const socket = io(socketUrl);

		// Listen for reservation updates
		socket.on("reservationUpdate", (data: Reservation) => {
			setReservations((prevReservations) => {
				const updatedReservations = prevReservations.map((reservation) =>
					reservation._id === data._id ? data : reservation
				);
				if (
					!updatedReservations.some(
						(reservation) => reservation._id === data._id
					)
				) {
					updatedReservations.push(data);
				}
				return updatedReservations;
			});
		});

		// Listen for reservation deletion
		socket.on("reservationDelete", (id: string) => {
			setReservations((prevReservations) =>
				prevReservations.filter((reservation) => reservation._id !== id)
			);
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	return reservations;
};

export default useReservations;
