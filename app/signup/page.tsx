"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const router = useRouter();
	const [error, setError] = useState("");
	const [user, setUser] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const handleInputChange = (event: any) => {
		const { name, value } = event.target;
		setUser((prevInfo) => ({ ...prevInfo, [name]: value }));
	};

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		console.log(user);
		try {
			if (
				!user.name ||
				!user.email ||
				!user.password ||
				!user.confirmPassword
			) {
				toast.error("Please fill out all required fields.");
				setLoading(false);
				return;
			}
			const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
			if (!emailRegex.test(user.email)) {
				setError("Invalid email address");
				toast.error("Invalid email address");
				setLoading(false);
				return;
			}

			// Password validation regex pattern
			const passwordRegex =
				/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
			if (!passwordRegex.test(user.password)) {
				setError("Invalid password");
				toast.error(
					"Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long"
				);
				setLoading(false);
				return;
			}

			if (user.password !== user.confirmPassword) {
				setError("Passwords do not match");
				toast.error("Passwords do not match");
				setLoading(false);
				return;
			}

			const res = await axios.post("/api/register", user);
			console.log(res.data);
			if (res.status === 200 || res.status === 201) {
				toast.success("Registered successfully!");
				setError("");
				setTimeout(() => {
					router.push("/");
				}, 2000); // Redirect after 2 seconds
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred during registration. Please try again.");
			setError("");
			setLoading(false);
			return;
		}

		// Reset form fields after successful registration
		setLoading(false);
		setUser({
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		});
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-slate-50 p-8">
			<ToastContainer autoClose={5000} />
			<form
				className="flex flex-col gap-6 md:flex-row bg-white rounded-lg shadow-lg overflow-hidden"
				onSubmit={handleSubmit}
			>
				<div className="bg-[#f93e9e] text-white flex flex-col justify-between w-[500px]">
					<div className="p-16 pt-40">
						<h1 className="text-4xl font-extrabold mb-4 whitespace-nowrap">
							Welcome to Sign Up
						</h1>
						<p className="mb-2">Have an account?</p>
						<div className="pt-6">
							<a
								className="p-2 px-6 border-[1px] border-white rounded-full text-white"
								href="/"
							>
								Log In
							</a>
						</div>
					</div>
				</div>
				<div className="p-12 flex flex-col gap-6 w-[500px]">
					<h1 className="text-4xl font-bold mb-4">Sign Up</h1>
					<div>
						<h2 className="font-extrabold mb-1">Fullname</h2>
						<input
							type="text"
							name="name"
							className="w-full bg-slate-100 p-3 rounded-full"
							placeholder="John Doe"
							value={user.name}
							onChange={handleInputChange}
						/>
					</div>
					<div>
						<h2 className="font-extrabold mb-1">Email</h2>
						<input
							type="email"
							name="email"
							className="w-full bg-slate-100 p-3 rounded-full"
							placeholder="example@123.com"
							value={user.email}
							onChange={handleInputChange}
						/>
					</div>
					<div className="relative">
						<h2 className="font-extrabold mb-1">Password</h2>
						<input
							type={showPassword ? "text" : "password"}
							name="password"
							className="w-full bg-slate-100 p-3 rounded-full"
							placeholder="**********"
							value={user.password}
							onChange={handleInputChange}
						/>
						<div
							className="absolute top-11 text-gray-500 right-4 cursor-pointer"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? <FaEyeSlash /> : <FaEye />}
						</div>
					</div>
					<div className="relative">
						<h2 className="font-extrabold mb-1">Confirm Password</h2>
						<input
							type={showConfirmPassword ? "text" : "password"}
							name="confirmPassword"
							className="w-full bg-slate-100 p-3 rounded-full"
							placeholder="**********"
							value={user.confirmPassword}
							onChange={handleInputChange}
						/>
						<div
							className="absolute top-11 text-gray-500 right-4 cursor-pointer"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						>
							{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
						</div>
					</div>
					<div>
						<button
							type="submit"
							className="w-full px-10 py-3 rounded-full bg-[#f93e9e] text-white font-bold"
						>
							{loading ? "Processing..." : "Register"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default Signup;
