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
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">Edit Reservation</h3>

        <div className="modal-grid">
          <label>
            <span className="modal-label">Name</span>
            <input
              className="modal-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            <span className="modal-label">Phone</span>
            <input
              className="modal-input"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+1 720-123-4567"
            />
          </label>

          <label>
            <span className="modal-label">Party Size</span>
            <input
              className="modal-input"
              type="number"
              min={1}
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </label>

          <label>
            <span className="modal-label">Time</span>
            <select
              className="modal-input"
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
          </label>
        </div>

        <div className="modal-actions">
          <button className="modal-btn secondary" onClick={close}>
            Cancel
          </button>

          <button className="modal-btn primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
