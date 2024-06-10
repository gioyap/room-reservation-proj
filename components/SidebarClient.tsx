import React from "react";
import { IoHomeSharp } from "react-icons/io5";
import { FaFile } from "react-icons/fa";
const SidebarClient = () => {
	return (
		<div className=" lg:w-[50px] 2xl:w-[80px] bg-[#96b9d0] lg:h-[600px] 2xl:h-[919px] p-3 absolute shadow-xl">
			<div className="flex flex-col items-center mb-8">
				{/* Additional buttons for navigation */}
				<a
					href="/dashboard"
					className="bg-[#e81e83] hover:bg-[#3fa8ee] text-white rounded lg:text-[12px] 2xl:text-[20px] w-auto lg:p-2 2xl:p-3 uppercase font-extrabold shadow-lg mb-4"
				>
					<IoHomeSharp />
				</a>
				<a
					href="/dashboard/records"
					className="bg-[#e81e83] hover:bg-[#3fa8ee] text-white rounded lg:text-[12px] 2xl:text-[20px] w-auto lg:p-2 2xl:p-3 uppercase font-extrabold shadow-lg mb-4"
				>
					<FaFile />
				</a>
			</div>
		</div>
	);
};

export default SidebarClient;
