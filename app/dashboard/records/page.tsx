"use client";
import SidebarClient from "../../../components/SidebarClient";
import React from "react";

const AdminDashboard = () => {
	return (
		<div className="flex">
			<SidebarClient />
			<div className="flex justify-center items-center w-full h-screen lg:text-3xl 2xl:text-5xl font-extrabold text-[#e81e83]">
				Still Developing...
			</div>
		</div>
	);
};

export default AdminDashboard;
