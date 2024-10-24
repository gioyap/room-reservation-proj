// app/layout.tsx
import ClientLayout from "../components/ClientLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Calendar Reservation",
	description: "Booking Calendar System in Head Office of Flawless",
	icons: {
		icon: "/mobile.png", // Path to your favicon (usually located in the public folder)
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ClientLayout>{children}</ClientLayout>;
}
