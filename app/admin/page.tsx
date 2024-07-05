"use client";
import Sidebar from "../../components/Sidebar";
import React from "react";

const AdminDashboard = () => {
	return (
		<div className="flex">
			<Sidebar />
			<div className="flex justify-center items-center w-full h-screen lg:text-3xl 2xl:text-5xl font-extrabold text-[#e81e83]">
				Still Developing...
			</div>
		</div>
	);
};

export default AdminDashboard;
