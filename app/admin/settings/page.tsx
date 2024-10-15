// pages/admin.tsx
"use client";
import AddAdminUser from "@/components/AddAdminUser";
import Sidebar from "@/components/Sidebar";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminPage = () => {
	const [oldPassword, setOldPassword] = React.useState("");
	const [newPassword, setNewPassword] = React.useState("");
	const [confirmPassword, setConfirmPassword] = React.useState("");

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}

		try {
			const response = await fetch("/api/admin", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ oldPassword, newPassword }),
			});

			const contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Something went wrong");
				}

				toast.success("Password changed successfully");
			} else {
				throw new Error("Unexpected response format");
			}
		} catch (error: any) {
			console.error(error);
			toast.error(error.message || "An unexpected error occurred");
		}
	};

	return (
		<div className="flex">
			<Sidebar />
			<div className="flex flex-col w-full h-screen p-4">
				<h1 className="text-[2rem] xl:text-[3rem] font-bold text-center mt-5 lg:mt-10 text-[#3f3f3f]">
					Settings
				</h1>
				<div className="lg:flex lg:flex-row mt-6 xl:mt-10">
					<div className="flex-1 flex justify-center items-start">
						<form
							onSubmit={handleChangePassword}
							className="w-full lg:w-[20rem] xl:w-[50rem] max-w-md bg-slate-300 shadow-md rounded-lg p-6"
						>
							<h2 className="lg:text-2xl font-bold mb-4 text-[#3f3f3f]">
								Change Password
							</h2>
							<div className="mb-4 text-xs xl:text-lg">
								<label className="block text-gray-700 font-semibold mb-2">
									Old Password
								</label>
								<input
									type="password"
									placeholder="Old Password"
									value={oldPassword}
									onChange={(e) => setOldPassword(e.target.value)}
									className="w-full p-2 border border-gray-300 rounded"
								/>
							</div>
							<div className="mb-4 text-xs xl:text-lg">
								<label className="block text-gray-700 font-semibold mb-2">
									New Password
								</label>
								<input
									type="password"
									placeholder="New Password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className="w-full p-2 border border-gray-300 rounded"
								/>
							</div>
							<div className="mb-4 text-xs xl:text-lg">
								<label className="block text-gray-700 font-semibold mb-2">
									Confirm New Password
								</label>
								<input
									type="password"
									placeholder="Confirm New Password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="w-full p-2 border border-gray-300 rounded"
								/>
							</div>
							<button
								type="submit"
								className="w-full bg-[#3f3f3f] hover:bg-[#818181] text-white font-bold py-2 px-4 rounded text-xs xl:text-lg"
							>
								Change Password
							</button>
						</form>
						<ToastContainer />
					</div>
					<div className="lg:flex-1 xl:flex xl:justify-center items-start">
						<AddAdminUser />
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminPage;
