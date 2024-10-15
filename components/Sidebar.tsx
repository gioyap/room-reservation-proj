import React, { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { FaBars, FaTimes } from "react-icons/fa";

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
		<div className="relative lg:flex lg:flex-col lg:w-[200px] 2xl:w-[250px]">
			{/* Mobile and Tablet View Hamburger Button */}
			<div className="lg:hidden fixed top-0 left-0 p-3 z-50">
				<button
					onClick={toggleSidebar}
					className="p-2 text-white bg-[#686868] rounded-full focus:outline-none"
				>
					{isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
				</button>
			</div>

			{/* Sidebar Content */}
			<div
				ref={sidebarRef}
				className={`fixed top-0 left-0 h-screen bg-[#3f3f3f] p-3 transition-transform duration-300 ease-in-out z-40 lg:relative lg:translate-x-0 ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} lg:w-[200px] 2xl:w-[250px]`}
				style={{ width: "100%", maxWidth: "250px" }}
			>
				<div className="flex flex-col items-center mb-8">
					{/* Additional buttons for navigation */}
					<a
						href="/admin/accepted"
						className="bg-[#686868] hover:bg-[#818181] text-white rounded text-[12px] xl:text-[14px] w-auto p-3 uppercase font-extrabold shadow-lg mb-4 cursor-pointer"
					>
						Accepted Records
					</a>
					<a
						href="/admin/declined"
						className="bg-[#686868] hover:bg-[#818181] text-white rounded text-[12px] xl:text-[14px] w-auto p-3 uppercase font-extrabold shadow-lg mb-4 cursor-pointer"
					>
						Declined Records
					</a>
					<a
						href="/admin/pending"
						className="bg-[#686868] hover:bg-[#818181] text-white rounded text-[12px] xl:text-[14px] w-auto p-3 uppercase font-extrabold shadow-lg cursor-pointer"
					>
						Pending Records
					</a>
					<a
						href="/admin/settings"
						className="bg-[#686868] hover:bg-[#818181] text-white rounded text-[12px] xl:text-[14px] w-auto p-3 uppercase font-extrabold shadow-lg mt-4 cursor-pointer"
					>
						Settings
					</a>
					<a
						onClick={() => signOut({ callbackUrl: "/adminlandingpage" })}
						className="bg-[#686868] hover:bg-[#818181] text-white rounded text-[12px] xl:text-[14px] w-auto p-3 uppercase font-extrabold shadow-lg mt-4 cursor-pointer"
					>
						Logout
					</a>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
