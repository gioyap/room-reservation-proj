import React from "react";

interface Reservation {
	_id: string;
	company: string;
	department: string;
	name: string;
	title: string;
	fromDate: string;
	toDate: string;
	status: string;
	email: string;
}

interface PaginationProps {
	reservations: Reservation[];
	reservationsPerPage: number;
	currentPage: number;
	paginate: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
	reservations,
	reservationsPerPage,
	currentPage,
	paginate,
}) => {
	const totalPages = Math.ceil(reservations.length / reservationsPerPage);

	return (
		<div className="flex justify-center mt-4">
			<nav>
				<ul className="flex pl-0 rounded list-none flex-wrap">
					{currentPage > 1 && (
						<>
							<li
								className="text-xs font-semibold flex w-8 h-8 mx-1 justify-center items-center cursor-pointer leading-tight relative border rounded-full bg-white text-gray-800 border-gray-300 hover:bg-gray-200"
								onClick={() => paginate(1)}
							>
								{"<<"}
							</li>
							<li
								className="text-xs font-semibold flex w-8 h-8 mx-1 justify-center items-center cursor-pointer leading-tight relative border rounded-full bg-white text-gray-800 border-gray-300 hover:bg-gray-200"
								onClick={() => paginate(currentPage - 1)}
							>
								{"<"}
							</li>
						</>
					)}

					<li className="text-xs font-extrabold flex px-6 justify-center items-center cursor-pointer leading-tight relative border rounded-full bg-white text-gray-800 border-gray-300 hover:bg-gray-200">
						{currentPage} of {totalPages}
					</li>

					{currentPage < totalPages && (
						<>
							<li
								className="text-xs font-semibold flex w-8 h-8 mx-1 justify-center items-center cursor-pointer leading-tight relative border rounded-full bg-white text-gray-800 border-gray-300 hover:bg-gray-200"
								onClick={() => paginate(currentPage + 1)}
							>
								{">"}
							</li>
							<li
								className="text-xs font-semibold flex w-8 h-8 mx-1 justify-center items-center cursor-pointer leading-tight relative border rounded-full bg-white text-gray-800 border-gray-300 hover:bg-gray-200"
								onClick={() => paginate(totalPages)}
							>
								{">>"}
							</li>
						</>
					)}
				</ul>
			</nav>
		</div>
	);
};

export default Pagination;
