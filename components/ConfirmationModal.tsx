import React from "react";
import Modal from "react-modal";

interface ConfirmationModalProps {
	isOpen: boolean;
	onRequestClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	isOpen,
	onRequestClose,
	onConfirm,
	title,
	message,
}) => {
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
				<div className="flex justify-end space-x-4">
					<button
						onClick={onRequestClose}
						className="2xl:px-8 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
					>
						No
					</button>
					<button
						onClick={onConfirm}
						className="2xl:px-8 px-4 py-2 bg-[#e81e83] text-white rounded hover:bg-[#b92d73]"
					>
						Yes
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default ConfirmationModal;
