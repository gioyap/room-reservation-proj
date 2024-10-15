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
		<div className="flex justify-center items-center min-h-screen bg-slate-100 p-4 sm:p-6 md:p-8 lg:p-10">
			<ToastContainer autoClose={3000} />
			<form
				className="flex flex-col md:flex-row lg:gap-8 xl:gap-12 bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-3xl"
				onSubmit={handleSubmit}
			>
				<div className="bg-[#3f3f3f] text-white flex flex-col justify-between md:w-1/2 lg:w-1/3 p-6 md:p-8 lg:p-10">
					<div className="mb-6">
						<h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold mb-4">
							Welcome Admin
						</h1>
						<ul className="list-disc list-inside mb-4 text-sm md:text-base">
							<li>Review and approve new reservations</li>
							<li>Monitor the reservation records</li>
						</ul>
					</div>
				</div>

				<div className="flex-1 p-6 md:p-8 lg:p-10">
					<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 xl:mb-10 text-[#3f3f3f]">
						Sign In
					</h1>
					<div className="mb-4">
						<label className="block text-sm font-semibold mb-1" htmlFor="email">
							Email
						</label>
						<input
							type="text"
							name="email"
							value={user.email}
							className="w-full bg-slate-100 p-2 rounded-full"
							placeholder="example@123.com"
							onChange={handleInputChange}
						/>
					</div>
					<div className="mb-4">
						<label
							className="block text-sm font-semibold mb-1"
							htmlFor="password"
						>
							Password
						</label>
						<input
							type="password"
							name="password"
							className="w-full bg-slate-100 p-2 rounded-full"
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
							className="w-full py-2 rounded-full bg-[#3f3f3f] text-white font-bold"
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
