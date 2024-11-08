import React from "react";
import Modal from "react-modal";
import { toast } from "react-toastify"; // Ensure you have react-toastify installed

interface ConfirmationModalProps {
	isOpen: boolean;
	onRequestClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	processedBy?: string;
	isSubmitting?: boolean;
	onProcessedByChange?: (value: string) => void;
	isAdmin?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	isOpen,
	onRequestClose,
	onConfirm,
	title,
	message,
	processedBy,
	isSubmitting = false,
	onProcessedByChange,
	isAdmin = false,
}) => {
	const handleConfirm = () => {
		if (isAdmin && (!processedBy || processedBy === "")) {
			toast.error("Please select an admin.");
			return;
		}
		onConfirm();
	};

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onRequestClose}
			className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75"
			overlayClassName="fixed inset-0 bg-black bg-opacity-50"
			ariaHideApp={false}
		>
			<div className="bg-white rounded-lg shadow-lg p-6 max-w-sm lg:max-w-md 2xl:max-w-lg w-full">
				<h2 className="text-xl 2xl:text-2xl font-semibold mb-4">{title}</h2>
				<p className="mb-6 text-[12px] lg:text-[14px] 2xl:text-[16px]">
					{message}
				</p>
				{/* processedBy information displayed here */}
				{isAdmin && (
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Processed By
						</label>
						<select
							className="block w-full px-4 py-2 border rounded-md"
							value={processedBy || ""}
							onChange={(e) => {
								if (onProcessedByChange) {
									onProcessedByChange(e.target.value);
								}
							}}
						>
							<option value="">Select an admin</option>
							<option value="Ms. Olive Enriquez">Ms. Olive Enriquez</option>
							<option value="Ms. Beth Haylo">Ms. Beth Haylo</option>
							<option value="Ms. Hazel Cabundo">Ms. Hazel Cabundoc</option>
							<option value="MIS-IT">MIS-IT</option>
						</select>
					</div>
				)}
				<div className="flex justify-end space-x-4">
					<button
						onClick={onRequestClose}
						className="2xl:px-8 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
					>
						No
					</button>
					<button
						onClick={handleConfirm}
						className={`2xl:px-8 px-4 py-2 ${
							isSubmitting
								? "bg-gray-400 cursor-not-allowed"
								: "bg-[#3f3f3f] hover:bg-[#686868]"
						} text-white rounded`}
						disabled={isSubmitting}
					>
						{isSubmitting ? "Loading..." : "Yes"}
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default ConfirmationModal;
