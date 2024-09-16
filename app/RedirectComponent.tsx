"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const RedirectComponent = () => {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		const currentPath = window.location.pathname;

		if (status === "authenticated") {
			console.log("Authenticated status:", status);
			if (session?.user?.isAdmin) {
				const allowedPaths = [
					"/admin/accepted",
					"/admin/declined",
					"/admin/pending",
				];
				if (!allowedPaths.includes(currentPath)) {
					router.push("/adminlandingpage");
				}
			}
		} else if (status === "unauthenticated") {
			const allowedUnauthenticatedPaths = ["/", "/adminlandingpage", "/admin"];
			if (
				currentPath !== "/adminlandingpage" &&
				!allowedUnauthenticatedPaths.includes(currentPath)
			) {
				router.push("/adminlandingpage");
			}
		}
	}, [session, status, router]);

	return null;
};

export default RedirectComponent;
