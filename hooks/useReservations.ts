import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Reservation } from "@/types/type";

const socketUrl =
	process.env.NODE_ENV === "development"
		? "http://localhost:4000" // Use the port your Express server is listening on
		: "https://reservation-system-nu.vercel.app"; // Adjust to your production WebSocket server

const useReservations = () => {
	const [reservations, setReservations] = useState<Reservation[]>([]);

	useEffect(() => {
		const socket: Socket = io(socketUrl); // Adjust to your server URL

		socket.on("reservationUpdate", (updatedReservation: Reservation) => {
			setReservations((prevReservations) =>
				prevReservations.map((reservation) =>
					reservation._id === updatedReservation._id
						? updatedReservation
						: reservation
				)
			);
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	return reservations;
};

export default useReservations;
