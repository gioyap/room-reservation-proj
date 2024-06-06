import React from "react";
import { IoHomeSharp } from "react-icons/io5";
import { FaFile } from "react-icons/fa";
const SidebarClient = () => {
	return (
		<div className="w-[80px] bg-[#96b9d0] h-[919px] p-3 absolute shadow-xl">
			<div className="flex flex-col items-center mb-8">
				{/* Additional buttons for navigation */}
				<a
					href="/dashboard"
					className="bg-[#e81e83] hover:bg-[#3fa8ee] text-white rounded text-[12px] xl:text-[14px] w-auto p-3 uppercase font-extrabold shadow-lg mb-4"
				>
					<IoHomeSharp size={20} />
				</a>
				<a
					href="/dashboard/records"
					className="bg-[#e81e83] hover:bg-[#3fa8ee] text-white rounded text-[12px] xl:text-[14px] w-auto p-3 uppercase font-extrabold shadow-lg mb-4"
				>
					<FaFile size={20} />
				</a>
			</div>
		</div>
	);
};

export default SidebarClient;
