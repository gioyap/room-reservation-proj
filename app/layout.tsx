// app/layout.tsx
import ClientLayout from "@/components/ClientLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Calendar Reservation",
	description: "Next Authentication",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ClientLayout>{children}</ClientLayout>;
}
