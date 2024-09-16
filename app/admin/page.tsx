/* eslint-disable react/no-unescaped-entities */
"use client";
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
			router.push("/admin/pending");
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
				className="flex flex-col md:flex-row lg:gap-4 2xl:gap-8 bg-white rounded-lg shadow-lg overflow-hidden"
				onSubmit={handleSubmit}
			>
				<div className="bg-[#f93e9e] text-white flex flex-col justify-between lg:w-[400px] 2xl:w-[500px]">
					<div className="lg:p-16 lg:pt-36 2xl:p-24 2xl:pt-40">
						<h1 className="lg:text-3xl 2xl:text-4xl font-extrabold mb-4 whitespace-nowrap">
							Welcome Admin
						</h1>
						<ul className="list-disc list-inside mb-6">
							<li>Review and approve new reservations</li>
							<li>Monitor the reservation records</li>
						</ul>
					</div>
				</div>

				<div className="lg:p-8 2xl:p-12 flex flex-col lg:gap-4 2xl:gap-6 lg:w-[400px] 2xl:w-[500px]">
					<h1 className="lg:text-3xl 2xl:text-4xl font-bold lg:mb-2 2xl:mb-4">
						Sign In
					</h1>
					<div>
						<h2 className="font-extrabold mb-1">Email</h2>
						<input
							type="text"
							name="email"
							value={user.email}
							className="w-full bg-slate-100 lg:p-2 lg:px-4 2xl:p-3 2xl:px-5 rounded-full"
							placeholder="example@123.com"
							onChange={handleInputChange}
						/>
					</div>
					<div>
						<h2 className="font-extrabold mb-1">Password</h2>
						<input
							type="password"
							name="password"
							className="w-full bg-slate-100 lg:p-2 lg:px-4 2xl:p-3 2xl:px-5 rounded-full"
							placeholder="**********"
							value={user.password}
							onChange={handleInputChange}
						/>
					</div>
					<div className="flex items-center lg:mb-2 2xl:mb-4">
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
							className="w-full lg:py-2 2xl:px-10 2xl:py-3 rounded-full bg-[#f93e9e] text-white font-bold"
							disabled={loading}
						>
							{loading ? "Processing..." : "Sign In"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default Login;
