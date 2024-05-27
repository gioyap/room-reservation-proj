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
		<div
			className="min-h-screen"
			style={{
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
			}}
		>
			<ToastContainer autoClose={3000} />
			<div className="grid place-items-center mx-auto max-w-4xl w-full py-10 min-h-screen">
				<div className="flex justify-center items-center lg:flex-row flex-col gap-6 lg:gap-0 shadow-md rounded-2xl">
					<div className=" flex flex-col justify-center items-center py-6 bg-[#eff1f6] rounded-2xl">
						<div className="rounded shadow">
							<Image src={bg} alt="bg" className="w-[100px] h-[100px]" />
						</div>
						<div className="text-slate-900 font-medium text-xl pt-5">
							Hello! Welcome Back
						</div>

						<form
							className="w-full px-5 py-6 space-y-6"
							onSubmit={handleSubmit}
						>
							<div className="flex flex-col w-full lg:px-5">
								<label className="text-sm">Email</label>
								<div className="bg-white flex justify-start items-start py-3 px-4 rounded text-slate-600 text-lg mt-1">
									<Mail className="w-7 h-7 text-[#A1BDFD]" />
									<input
										type={"email"}
										placeholder="example@123.com"
										name="email"
										className="outline-none w-full px-4"
										value={user.email}
										onChange={handleInputChange}
									/>
								</div>
							</div>
							<div className="flex flex-col w-full lg:px-5">
								<label className="text-sm">Password</label>
								<div className="bg-white flex justify-start items-start py-3 px-4 rounded text-slate-600 text-lg mt-1">
									<Lock className="w-7 h-7 text-[#A1BDFD]" />
									<input
										type={"password"}
										placeholder="**********"
										name="password"
										className="outline-none w-full px-4"
										value={user.password}
										onChange={handleInputChange}
									/>
								</div>

								<div className="grid place-items-center w-full mx-auto pt-7">
									<button
										type="submit"
										className="bg-[#5D7DF3] text-white text-lg w-full px-8 py-3 rounded-md uppercase font-semibold"
									>
										Login
									</button>
								</div>
								<div className="flex justify-center w-full items-center gap-3 py-3">
									<div className="border-b border-gray-800 py-2 w-full px-6" />
									<div className="mt-3">or</div>
									<div className="border-b border-gray-800 py-2 w-full px-6" />
								</div>
								<div className="flex justify-center items-center w-full gap-8 pb-8">
									<div
										onClick={() => signIn("google")}
										className="rounded px-6 py-2 shadow cursor-pointer bg-gray-50 grid place-items-center mx-auto mb-4"
									>
										<Image src={google} alt="bg" width={100} height={100} />
									</div>{" "}
								</div>
								<div className="text-lg text-slate-900 font-medium">
									<span>Don't have an account?</span>
									<a
										href="/signup"
										className="text-[#5D7DF3] pl-3 hover:underline"
									>
										Create an account
									</a>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
