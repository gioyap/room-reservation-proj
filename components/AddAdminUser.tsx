// components/AddAdminUser.tsx
"use client";
import { useState } from "react";
import axios from "axios";

const AddAdminUser = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !password) {
			setMessage("Please provide both email and password.");
			return;
		}

		try {
			setLoading(true);
			const response = await axios.post("/api/admin/add", {
				email,
				password,
			});
			setMessage(response.data.message);
			setEmail("");
			setPassword("");
		} catch (error: any) {
			setMessage(
				"Error adding user: " + error.response?.data.message || error.message
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-10">
			<form
				onSubmit={handleSubmit}
				className="bg-slate-300 p-6 rounded-lg shadow-md lg:w-[20rem] xl:w-[30rem]"
			>
				<h2 className="lg:text-2xl font-bold mb-4 text-[#3f3f3f]">
					Add Admin User
				</h2>

				<label
					htmlFor="email"
					className="block mb-2 font-medium text-gray-700 text-xs xl:text-lg"
				>
					Email:
				</label>
				<input
					id="email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full p-2 border border-gray-300 rounded mb-4 text-xs xl:text-lg"
					placeholder="Admin Email"
					required
				/>

				<label
					htmlFor="password"
					className="block mb-2 font-medium text-gray-700 text-xs xl:text-lg"
				>
					Password:
				</label>
				<input
					id="password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full p-2 border border-gray-300 rounded mb-4 text-xs xl:text-lg"
					placeholder="Password"
					required
				/>

				<button
					type="submit"
					className="w-full bg-[#3f3f3f] hover:bg-[#818181] font-bold text-white p-2 rounded text-xs xl:text-lg"
					disabled={loading}
				>
					{loading ? "Saving..." : "Add Admin"}
				</button>

				{message && <p className="mt-4 text-red-500">{message}</p>}
			</form>
		</div>
	);
};

export default AddAdminUser;
