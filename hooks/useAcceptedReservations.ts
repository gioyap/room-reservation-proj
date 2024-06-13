import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Reservation } from "@/types/type";

const socketUrl =
	process.env.NODE_ENV === "development"
		? "http://localhost:4000"
		: "https://reservation-system-nu.vercel.app";

const useAcceptedReservations = () => {
	const [reservations, setReservations] = useState<Reservation[]>([]);

	useEffect(() => {
		const socket: Socket = io(socketUrl);

		socket.on("acceptedReservations", (updatedReservations: Reservation[]) => {
			setReservations(updatedReservations);
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	return reservations;
};

export default useAcceptedReservations;
