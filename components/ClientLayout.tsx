// components/ClientLayout.tsx
"use client";

import AuthProvider from "../components/Provider";
import RedirectComponent from "../app/RedirectComponent";
import { Mulish } from "next/font/google";
import "../app/globals.css";

const mulish = Mulish({ subsets: ["latin"] });

export default function ClientLayout({
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
					<RedirectComponent />
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}
