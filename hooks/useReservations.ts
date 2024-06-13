// hooks/useReservations.ts

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
			setReservations((prevReservations) => [...prevReservations, data]);
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	return reservations;
};

export default useReservations;
