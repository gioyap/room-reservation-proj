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
			if (session?.user?.isAdmin) {
				const allowedPaths = [
					"/admin",
					"/admin/accepted",
					"/admin/decline",
					"/admin/pending",
				];
				//router.push("/admin");
			} else {
				router.push("/dashboard");
			}
		}
	}, [session, status, router]);

	return null;
};

export default RedirectComponent;
