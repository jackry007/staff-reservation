import React, { useEffect } from "react";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onCancel();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onCancel]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
                <p className="mb-5 text-sm text-gray-300">{message}</p>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm text-white"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;