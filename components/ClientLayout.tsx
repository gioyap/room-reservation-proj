// components/ClientLayout.tsx
import AuthProvider from "../components/Provider";
import RedirectComponent from "../app/RedirectComponent";
import "../app/globals.css";

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
				className="font-sans" // Replace with your desired font class or style
			>
				<AuthProvider>
					<RedirectComponent />
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}
