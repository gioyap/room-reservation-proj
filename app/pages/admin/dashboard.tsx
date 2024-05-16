import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function AdminDashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();

	if (status === "loading") {
		return <p>Loading...</p>;
	}

	if (status === "unauthenticated") {
		signIn();
		return <p>Redirecting...</p>;
	}

	if (session?.user.email !== process.env.ADMIN_EMAIL) {
		router.push("/");
		return <p>Access denied</p>;
	}

	return (
		<div>
			<h1>Admin Dashboard</h1>
			{/* Admin functionalities go here */}
		</div>
	);
}
