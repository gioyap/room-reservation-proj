import { signOut } from "next-auth/react";
import React from "react";

const Sidebar = () => {
	return (
		<div className="w-[250px] bg-[#e81e83] h-screen p-3">
			<div className="flex flex-col items-center mb-8">
				{/* Additional buttons for navigation */}
				<a
					href="/admin"
					className="bg-[#f93e9e] hover:bg-[#3fa8ee] text-white rounded text-[12px] xl:text-[14px] w-auto p-3 uppercase font-extrabold shadow-lg mb-4"
				>
					Admin Dashboard
				</a>
				<a
					href="/admin/accepted"
					className="bg-[#f93e9e] hover:bg-[#3fa8ee] text-white rounded text-[12px] xl:text-[14px] w-auto p-3 uppercase font-extrabold shadow-lg mb-4"
				>
					Accepted Records
				</a>
				<a
					href="/admin/declined"
					className="bg-[#f93e9e] hover:bg-[#3fa8ee] text-white rounded text-[12px] xl:text-[14px] w-auto p-3 uppercase font-extrabold shadow-lg mb-4"
				>
					Declined Records
				</a>
				<a
					href="/admin/pending"
					className="bg-[#f93e9e] hover:bg-[#3fa8ee] text-white rounded text-[12px] xl:text-[14px] w-auto p-3 uppercase font-extrabold shadow-lg"
				>
					Pending Records
				</a>
				<a
					onClick={() => signOut()}
					className="bg-[#f93e9e] hover:bg-[#3fa8ee] text-white rounded text-[12px] xl:text-[14px] w-auto p-3 uppercase font-extrabold shadow-lg mt-4"
				>
					Logout
				</a>
			</div>
		</div>
	);
};

export default Sidebar;
