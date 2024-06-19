import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Reservation } from "@/types/type";

const socketUrl =
	process.env.NODE_ENV === "development"
		? "http://localhost:4000"
		: "https://reservation-system-nu.vercel.app";

interface UseDeclinedReservationsProps {
	initialReservations?: Reservation[];
}

const useDeclinedReservations = ({
	initialReservations = [],
}: UseDeclinedReservationsProps) => {
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

		const handleDeclinedReservations = (declinedReservation: Reservation) => {
			setReservations((prevReservations) =>
				prevReservations.map((reservation) =>
					reservation._id === declinedReservation._id
						? declinedReservation
						: reservation
				)
			);
		};

		socket.on("declinedReservations", handleDeclinedReservations);

		// Cleanup to avoid memory leaks
		return () => {
			socket.off("declinedReservations", handleDeclinedReservations);
		};
	}, [socket, setReservations]);

	return { reservations, setReservations, socket };
};

export default useDeclinedReservations;
