/* eslint-disable react/no-unescaped-entities */
"use client";

import { Mail, Lock } from "lucide-react";
import Image from "next/image";
import bg from "../public/bg-2.png";
import google from "../public/google2.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

const Login = () => {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const [error, setError] = useState("");
	const [user, setUser] = useState({
		email: "",
		password: "",
	});

	const handleInputChange = (event: any) => {
		const { name, value } = event.target;
		return setUser((prevInfo) => ({ ...prevInfo, [name]: value }));
	};

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		setLoading(true);
		try {
			if (!user.email || !user.password) {
				toast.error("Please fill out all required fields");
				return;
			}
			const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
			if (!emailRegex.test(user.email)) {
				setError("invalid email id");
				toast.error("Invalid email address");
				return;
			}

			const res = await signIn("credentials", {
				email: user.email,
				password: user.password,
				redirect: false,
			});

			if (res?.error) {
				console.log(res);
				setError("error");
			}

			setError("");
			router.push("/dashboard");
		} catch (error) {
			console.log(error);
			toast.error("An error occurred during log in. Please try again.");
			setError("");
		} finally {
			setLoading(false);

			setUser({
				email: "",
				password: "",
			});
		}
	};
	return (
		<div className="flex justify-center items-center min-h-screen bg-slate-50 p-8">
			<ToastContainer autoClose={3000} />
			<form
				className="flex flex-col md:flex-row gap-8 bg-white rounded-lg shadow-lg overflow-hidden"
				onSubmit={handleSubmit}
			>
				<div className="bg-[#f93e9e] text-white flex flex-col justify-between w-[500px]">
					<div className="p-24 pt-40">
						<h1 className="text-4xl font-extrabold mb-4 whitespace-nowrap">
							Welcome to Login
						</h1>
						<p className="mb-2">Don't have an account?</p>
						<div className="pt-6">
							<a
								className="p-2 px-6 border-[1px] border-white rounded-full text-white"
								href="/signup"
							>
								Sign Up
							</a>
						</div>
					</div>
				</div>
				<div className="p-12 flex flex-col gap-6 w-[500px]">
					<h1 className="text-4xl font-bold mb-4">Sign In</h1>
					<div>
						<h2 className="font-extrabold mb-1">Email</h2>
						<input
							type="email"
							name="email"
							value={user.email}
							className="w-full bg-slate-100 p-3 rounded-full"
							placeholder="example@123.com"
							onChange={handleInputChange}
						/>
					</div>
					<div>
						<h2 className="font-extrabold mb-1">Password</h2>
						<input
							type="password"
							name="password"
							className="w-full bg-slate-100 p-3 rounded-full"
							placeholder="**********"
							value={user.password}
							onChange={handleInputChange}
						/>
					</div>
					<div>
						<button
							type="submit"
							className="w-full px-10 py-3 rounded-full bg-[#f93e9e] text-white font-bold"
						>
							Sign in
						</button>
					</div>
					<div
						onClick={() => signIn("google")}
						className="flex justify-center cursor-pointer mt-4"
					>
						<Image src={google} alt="Sign in with Google" width={80} />
					</div>
				</div>
			</form>
		</div>
	);
};

export default Login;
