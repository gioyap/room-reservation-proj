"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const RedirectComponent = () => {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "authenticated") {
			console.log("test", status);
			const currentPath = window.location.pathname;
			if (session?.user?.isAdmin) {
				const allowedPaths = [
					"/admin",
					"/admin/accepted",
					"/admin/declined",
					"/admin/pending",
				];
				if (!allowedPaths.includes(currentPath)) {
					router.push("/admin");
				}
			} else {
				router.push("/dashboard");
			}
		} else if (status === "unauthenticated") {
			const allowedUnauthenticatedPaths = ["/", "/signup"];
			const currentPath = window.location.pathname;
			if (!allowedUnauthenticatedPaths.includes(currentPath)) {
				router.push("/");
			}
		}
	}, [session, status, router]);

	return null;
};

export default RedirectComponent;
