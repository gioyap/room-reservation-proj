// hooks/usePendingReservations.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Reservation } from "@/types/type"; // Adjust path as per your file structure

interface UsePendingReservationsProps {
	initialReservations: Reservation[];
}

const usePendingReservations = ({
	initialReservations,
}: UsePendingReservationsProps) => {
	const [reservations, setReservations] =
		useState<Reservation[]>(initialReservations);
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const newSocket = io("http://localhost:4000");

		newSocket.emit("message", "Hello, server!");

		newSocket.on("reply", (data) => {
			console.log("Server replied:", data);
			// Update state or perform actions based on server response
		});

		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

	useEffect(() => {
		if (!socket) return;

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
			socket.off("reservationUpdate");
		};
	}, [socket]);

	return { reservations, socket, setReservations };
};

export default usePendingReservations;
