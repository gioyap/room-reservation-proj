// components/ClientLayout.tsx
"use client";

import AuthProvider from "@/components/Provider";
import RedirectComponent from "@/app/RedirectComponent";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Mulish } from "next/font/google";
import "@/app/globals.css";

const mulish = Mulish({ subsets: ["latin"] });

let socket: Socket;

export default function ClientLayout({
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
					<RedirectComponent />
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}
