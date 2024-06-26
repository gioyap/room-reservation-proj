import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connect } from "../utils/config/database";
import User from "../utils/models/auth";
import bcryptjs from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

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
		GoogleProvider({
			clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET as string,
		}),
	],
	session: {
		strategy: "jwt",
	},

	callbacks: {
		async signIn({ user, account }: { user: any; account: any }) {
			if (account.provider === "google") {
				try {
					const { name, email } = user;
					await connect();
					const existingUser = await User.findOne({ email });
					if (existingUser) {
						return { ...user, name, email, isAdmin: email === adminEmail };
					}
					const newUser = new User({
						name,
						email,
						isAdmin: email === adminEmail,
					});
					const res = await newUser.save();
					if (res) {
						return { ...user, name, email, isAdmin: email === adminEmail };
					}
				} catch (err) {
					return false;
				}
			}
			return true;
		},

		async jwt({ token, user }: { token: any; user: any }) {
			if (user) {
				token.email = user.email;
				token.name = user.name;
				token.isAdmin = user.email === adminEmail;
			}
			return token;
		},

		async session({ session, token }: { session: any; token: any }) {
			if (session.user) {
				session.user.email = token.email;
				session.user.name = token.name;
				session.user.isAdmin = token.isAdmin;
			}
			return session;
		},
	},

	secret: process.env.NEXTAUTH_SECRET!,
	pages: {
		signIn: "/",
	},
};
