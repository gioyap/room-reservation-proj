import React, { useState } from "react";
import { IoHomeSharp } from "react-icons/io5";
import { FaFile, FaBars, FaTimes } from "react-icons/fa";

const SidebarClient = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<div
			className={`lg:w-[50px] 2xl:w-[80px] bg-[#96b9d0] lg:h-[800px] 2xl:h-[919px] p-3 fixed top-0 left-0 shadow-xl h-screen ${
				isSidebarOpen ? "block" : "hidden"
			} lg:block`}
		>
			{/* Mobile Hamburger Menu */}
			<div className="lg:hidden flex items-center justify-between mb-4">
				<button
					onClick={toggleSidebar}
					className="p-2 text-[#ffdc2e] bg-[#3fa8ee] rounded-full focus:outline-none"
				>
					{isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
				</button>
			</div>

			{/* Sidebar Content */}
			<div
				className={`flex flex-col items-center ${
					isSidebarOpen ? "block" : "hidden"
				} lg:flex`}
			>
				{/* Additional buttons for navigation */}
				<a
					href="/"
					className="bg-[#ffdc2e] hover:bg-[#3fa8ee] text-black rounded lg:text-[12px] 2xl:text-[20px] w-auto p-1 lg:p-2 2xl:p-3 uppercase font-extrabold shadow-lg mb-4"
				>
					<IoHomeSharp />
				</a>
				<a
					href="/dashboard/records"
					className="bg-[#ffdc2e] hover:bg-[#3fa8ee] text-black rounded lg:text-[12px] 2xl:text-[20px] w-auto p-1 lg:p-2 2xl:p-3 uppercase font-extrabold shadow-lg mb-4"
				>
					<FaFile />
				</a>
			</div>
		</div>
	);
};

export default SidebarClient;
