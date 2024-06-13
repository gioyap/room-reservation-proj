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

		socket.on("reservationUpdate", (data: Reservation) => {
			setReservations((prevReservations) => {
				// Check if the reservation already exists
				const existingReservationIndex = prevReservations.findIndex(
					(reservation) => reservation._id === data._id
				);

				if (existingReservationIndex !== -1) {
					// Update the existing reservation
					const updatedReservations = [...prevReservations];
					updatedReservations[existingReservationIndex] = data;
					return updatedReservations;
				}

				// Add the new reservation
				return [...prevReservations, data];
			});
		});

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
