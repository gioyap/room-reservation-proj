// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
//console log is for testing
export async function middleware(req: NextRequest) {
	const token = await getToken({
		req,
		secret: process.env.NEXTAUTH_SECRET,
	});

	const path = req.nextUrl.pathname;
	//console.log("Path:", path);

	const publicPaths = ["/", "/signup"];
	const isPublicPath = publicPaths.includes(path);

	if (isPublicPath && token) {
		// console.log("Redirecting to /dashboard");
		return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
	}

	if (!isPublicPath && !token) {
		// console.log("Redirecting to /");
		return NextResponse.redirect(new URL("/", req.nextUrl));
	}

	if (path.startsWith("/admin")) {
		if (!token || !token.isAdmin) {
			// console.log("Admin access denied, redirecting to /");
			return NextResponse.redirect(new URL("/", req.nextUrl));
		}
	}

	// Remove unnecessary redirect to /admin/dashboard
	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/signup", "/dashboard", "/admin"],
};
