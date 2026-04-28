import React, { useState, useEffect } from "react";
import { updateReservation } from "./googleSheetsApi";

const EditModal = ({ reservation, close, refresh }) => {
  const [name, setName] = useState(reservation.name || "");
  const [phone, setPhone] = useState(reservation.phone || "");
  const [size, setSize] = useState(reservation.size || "");
  const [time, setTime] = useState(reservation.time || "");

  const handleSave = async () => {
    try {
      const result = await updateReservation(reservation.id, {
        name,
        phone,
        size: Number(size),
        time,
        date: reservation.date,
      });

      if (!result.success) {
        alert("Failed to update reservation.");
        return;
      }

      refresh();
      close();
    } catch (error) {
      alert("Failed to update reservation.");
    }
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
          className="bg-gray-700 text-white border border-gray-600 p-2 w-full mb-3 rounded"
          type="number"
          min={1}
          value={size}
          onChange={(e) => setSize(e.target.value)}
        />

        <label className="block text-sm mb-1">Time</label>
        <select
          className="bg-gray-700 text-white border border-gray-600 p-2 w-full mb-5 rounded"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        >
          <option value="">Select a time</option>
          {[
            "11:00 AM",
            "11:30 AM",
            "12:00 PM",
            "12:30 PM",
            "1:00 PM",
            "1:30 PM",
            "2:00 PM",
            "2:30 PM",
            "3:00 PM",
            "3:30 PM",
            "4:00 PM",
            "4:30 PM",
            "5:00 PM",
            "5:30 PM",
            "6:00 PM",
            "6:30 PM",
            "7:00 PM",
            "7:30 PM",
            "8:00 PM",
            "8:30 PM",
            "9:00 PM",
            "9:30 PM",
          ].map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>

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
