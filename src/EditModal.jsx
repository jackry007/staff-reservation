import React, { useState, useEffect } from "react";
import { updateReservation } from "./googleSheetsApi";

const EditModal = ({ reservation, close, refresh, updateReservationLocal }) => {
  const formatPhoneInput = (value) => {
    let digits = String(value || "").replace(/\D/g, "");

    if (digits.startsWith("1")) {
      digits = digits.slice(1);
    }

    digits = digits.slice(0, 10);

    let formatted = "+1 ";
    if (digits.length > 0) formatted += digits.slice(0, 3);
    if (digits.length >= 4) formatted += "-" + digits.slice(3, 6);
    if (digits.length >= 7) formatted += "-" + digits.slice(6, 10);

    return formatted;
  };

  const [name, setName] = useState(reservation.name || "");
  const [phone, setPhone] = useState(formatPhoneInput(reservation.phone || ""));
  const [size, setSize] = useState(reservation.size || "");
  const [time, setTime] = useState(reservation.time || "");

  const handlePhoneChange = (e) => {
    setPhone(formatPhoneInput(e.target.value));
  };

  const handleSave = async () => {
    const updatedReservation = {
      ...reservation,
      name,
      phone: String(phone),
      size: Number(size),
      time,
      date: reservation.date,
    };

    updateReservationLocal(updatedReservation);
    close();

    try {
      const result = await updateReservation(
        reservation.id,
        updatedReservation,
      );

      if (!result.success) {
        alert("Google Sheets failed to save. Refreshing latest data.");
        await refresh();
      }
    } catch (error) {
      alert("Google Sheets failed to save. Refreshing latest data.");
      await refresh();
    }
  };
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [close]);

  const timeSlots = [
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
  ];

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
          onChange={handlePhoneChange}
          placeholder="+1 720-123-4567"
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
          {timeSlots.map((slot) => (
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
