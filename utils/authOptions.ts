import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connect } from "../utils/config/database";
import User from "../utils/models/auth";
import bcryptjs from "bcryptjs";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {},
			async authorize(credentials) {
				const { email, password } = credentials as {
					email: string;
					password: string;
				};
				try {
					await connect();
					const user = await User.findOne({ email });
					if (!user) {
						console.log("No user found with email:", email);
						return null;
					}

					// Check password
					const passwordsMatch = await bcryptjs.compare(
						password,
						user.password
					);
					if (!passwordsMatch) {
						console.log("Password does not match for email:", email);
						return null;
					}

					console.log("User authenticated:", email);
					return user;
				} catch (error) {
					console.log("Error during credentials authorization:", error);
					return null;
				}
			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async signIn({ user }: { user: any }) {
			// Allow all users to sign in, no admin check
			return true;
		},
		async jwt({ token, user }: { token: any; user: any }) {
			if (user) {
				token.email = user.email;
				token.name = user.name;
			}
			return token;
		},
		async session({ session, token }: { session: any; token: any }) {
			if (session.user) {
				session.user.email = token.email;
				session.user.name = token.name;
			}
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET!,
	pages: {
		signIn: "/adminlandingpage", // Adjust this path as needed
	},
};
