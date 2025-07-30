import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const EditModal = ({ reservation, close, refresh }) => {
    const [name, setName] = useState(reservation.name);
    const [phone, setPhone] = useState(reservation.phone);
    const [size, setSize] = useState(reservation.size);

    const handleSave = async () => {
        const { data, error } = await supabase
            .from("reservations")
            .update({
                name,
                phone,
                size,
                date: reservation.date,
            })
            .eq("id", reservation.id);

        if (error) {
            alert("Failed to update reservation: " + error.message);
            return;
        }

        refresh();
        close();
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [close]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Edit Reservation</h3>

                <label className="block text-sm mb-1">Name</label>
                <input
                    className="bg-gray-700 text-white border border-gray-600 p-2 w-full mb-3 rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <label className="block text-sm mb-1">Phone</label>
                <input
                    className="bg-gray-700 text-white border border-gray-600 p-2 w-full mb-3 rounded"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <label className="block text-sm mb-1">Party Size</label>
                <input
                    className="bg-gray-700 text-white border border-gray-600 p-2 w-full mb-5 rounded"
                    type="number"
                    min={1}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                />

                <div className="flex justify-end gap-2">
                    <button
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        onClick={close}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;