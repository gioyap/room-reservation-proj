import AuthProvider from "@/components/Provider";
import RedirectComponent from "./RedirectComponent"; // Import the RedirectComponent
import "./globals.css";
import type { Metadata } from "next";
import { Mulish } from "next/font/google";

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
