import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Reservation } from "@/types/type"; // Adjust path as per your file structure

const socketUrl =
	process.env.NODE_ENV === "development"
		? "http://localhost:4000"
		: "https://reservation-system-nu.vercel.app";

interface UsePendingReservationsProps {
	initialReservations: Reservation[];
}

const usePendingReservations = ({
	initialReservations,
}: UsePendingReservationsProps) => {
	const [reservations, setReservations] =
		useState<Reservation[]>(initialReservations);
	const [socket, setSocket] = useState<Socket | null>(null);

	// Socket initialization effect
	useEffect(() => {
		const newSocket = io(socketUrl);

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

	// Effect for handling socket events
	useEffect(() => {
		if (!socket) return;

		const handleReservationUpdate = (updatedReservation: Reservation) => {
			setReservations((prevReservations) =>
				prevReservations.map((reservation) =>
					reservation._id === updatedReservation._id
						? updatedReservation
						: reservation
				)
			);
		};

		socket.on("reservationUpdate", handleReservationUpdate);

		// Cleanup to avoid memory leaks
		return () => {
			socket.off("reservationUpdate", handleReservationUpdate);
		};
	}, [socket, setReservations]);

	return { reservations, socket, setReservations };
};

export default usePendingReservations;
