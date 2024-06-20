import AuthProvider from "@/components/Provider";
import RedirectComponent from "./RedirectComponent"; // Import the RedirectComponent
import "./globals.css";
import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import { io, Socket } from "socket.io-client";
import { useEffect } from "react";

let socket: Socket;

const mulish = Mulish({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Calendar Reservation",
	description: "Next Authentication",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		socket = io("http://localhost:4000");

		socket.on("update-reservations", (data: any) => {
			console.log("New reservation data:", data);
		});

		return () => {
			socket.off("update-reservations");
		};
	}, []);

	return (
		<html lang="en">
			<body
				suppressContentEditableWarning
				suppressHydrationWarning
				className={mulish.className}
			>
				<AuthProvider>
					<RedirectComponent /> {/* Add the redirection logic component */}
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}
