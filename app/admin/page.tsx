"use client";
import { signOut, useSession } from "next-auth/react";

const AdminDashboard = () => {
	const { data: session } = useSession();

	if (!session || !session.user.isAdmin) {
		return <p>Access Denied</p>;
	}

	return (
		<div className="flex justify-between">
			<div className="w-[900px] h-[700px] bg-slate-200 ml-20 mt-20">
				<table className="">
					<thead>
						<tr>
							<th>Department</th>
							<th>Name</th>
							<th>Room</th>
							<th>Start Date</th>
							<th>Duration (hours)</th>
							<th>Duration (minutes)</th>
							<th>Status</th>
							<th>
								<button>Accepted</button>
							</th>
							<th>
								<button>Decline</button>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>test</td>
							<td>test</td>
							<td>test</td>
							<td>test</td>
							<td>test</td>
							<td>test</td>
							<td>Pending</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div>
				<button
					onClick={() => signOut()}
					className="bg-[#e61e84] hover:bg-[#3fa8ee] text-white rounded text-[12px] xl:text-[18px] w-auto p-2 uppercase font-extrabold"
				>
					Logout
				</button>
			</div>
		</div>
	);
};

export default AdminDashboard;
