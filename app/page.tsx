/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import google from "../public/google2.svg";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

const Login = () => {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const [error, setError] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [user, setUser] = useState({
		email: "",
		password: "",
	});

	useEffect(() => {
		// Check if email and password are saved in localStorage
		const savedEmail = localStorage.getItem("rememberedEmail");
		const savedPassword = localStorage.getItem("rememberedPassword");
		if (savedEmail && savedPassword) {
			setUser({ email: savedEmail, password: savedPassword });
			setRememberMe(true);
		}
	}, []);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setUser((prevInfo) => ({ ...prevInfo, [name]: value }));
	};

	const handleRememberMeChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRememberMe(event.target.checked);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			if (!user.email || !user.password) {
				toast.error("Please fill out all required fields");
				setLoading(false);
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
				toast.error("Invalid email or password");
				setLoading(false);
				return;
			}

			if (rememberMe) {
				localStorage.setItem("rememberedEmail", user.email);
				localStorage.setItem("rememberedPassword", user.password);
			} else {
				localStorage.removeItem("rememberedEmail");
				localStorage.removeItem("rememberedPassword");
			}

			toast.success("Logged in successfully!");
			setError("");
			router.push("/dashboard");
		} catch (error) {
			console.log(error);
			toast.error("An error occurred during login. Please try again.");
			setError("");
		} finally {
			setLoading(false);
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
							type="text"
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
					<div className="flex items-center mb-4">
						<input
							type="checkbox"
							checked={rememberMe}
							onChange={handleRememberMeChange}
							id="rememberMe"
							className="mr-2"
						/>
						<label htmlFor="rememberMe" className="text-sm">
							Remember Me
						</label>
					</div>
					<div>
						<button
							type="submit"
							className="w-full px-10 py-3 rounded-full bg-[#f93e9e] text-white font-bold"
							disabled={loading}
						>
							{loading ? "Processing..." : "Sign In"}
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
