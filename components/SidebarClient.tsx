import React, { useState, useRef, useEffect } from "react";
import { IoHomeSharp } from "react-icons/io5";
import { FaFile, FaBars, FaTimes } from "react-icons/fa";

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const sidebarRef = useRef<HTMLDivElement>(null);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				sidebarRef.current &&
				!sidebarRef.current.contains(event.target as Node)
			) {
				setIsSidebarOpen(false);
			}
		};

		if (isSidebarOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isSidebarOpen]);

	return (
		<div className="relative lg:absolute lg:flex lg:flex-col lg:w-[50px] xl:w-[80px]">
			{/* Mobile and Tablet View Hamburger Button */}
			<div className="lg:hidden fixed top-0 left-0 p-3 z-50">
				<button
					onClick={toggleSidebar}
					className="p-2 text-white bg-[#f93e9e] rounded-full focus:outline-none"
				>
					{isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
				</button>
			</div>

			{/* Sidebar Content */}
			<div
				ref={sidebarRef}
				className={`fixed w-[50px] top-0 left-0 h-screen bg-[#e81e83] p-4 transition-transform duration-300 ease-in-out z-40 lg:relative lg:translate-x-0 ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
				style={{ width: "100%", maxWidth: "250px" }}
			>
				<div className="flex flex-col items-center mb-8">
					{/* Additional buttons for navigation */}
					<a
						href="/"
						className="bg-[#ffdc2e] hover:bg-[#3fa8ee] text-black rounded lg:text-xs xl:text-sm 2xl:text-lg w-full p-2 lg:p-1 uppercase font-extrabold shadow-lg mb-2"
					>
						<IoHomeSharp className="text-lg lg:text-base xl:text-xl 2xl:text-2xl" />
					</a>
					<a
						href="/dashboard/records"
						className="bg-[#ffdc2e] hover:bg-[#3fa8ee] text-black rounded lg:text-xs xl:text-sm 2xl:text-lg w-full p-2 lg:p-1 uppercase font-extrabold shadow-lg"
					>
						<FaFile className="text-lg lg:text-base xl:text-xl 2xl:text-2xl" />
					</a>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
