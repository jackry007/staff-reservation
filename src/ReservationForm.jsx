import React, { useState } from "react";
import { createReservation } from "./googleSheetsApi";

const ReservationForm = ({ selectedDate, refresh, addReservationLocal }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+1 ");
  const [size, setSize] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const phoneRegex = /^\+1 \d{3}-\d{3}-\d{4}$/;

  const formatDateLocal = (date) => date.toLocaleDateString("en-CA");

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

  const handlePhoneChange = (e) => {
    let input = e.target.value;

    if (!input.startsWith("+1 ")) {
      input = "+1 " + input.replace(/^\+?1?\s?/, "");
    }

    let digits = input.replace(/\D/g, "").slice(1);
    digits = digits.slice(0, 10);

    let formatted = "+1 ";
    if (digits.length > 0) formatted += digits.slice(0, 3);
    if (digits.length >= 4) formatted += "-" + digits.slice(3, 6);
    if (digits.length >= 7) formatted += "-" + digits.slice(6, 10);

    setPhone(formatted);
  };

  const save = async () => {
    const newErrors = {};
    setError("");
    setSuccess("");

    if (!name.trim()) newErrors.name = true;
    if (!phoneRegex.test(phone)) newErrors.phone = true;
    if (!time) newErrors.time = true;
    if (!size || Number(size) < 1) newErrors.size = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError("Please fix the highlighted fields.");
      return;
    }

    const newReservation = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      name,
      phone: String(phone),
      size: Number(size),
      time,
      date: formatDateLocal(selectedDate),
    };

    addReservationLocal(newReservation);

    setName("");
    setPhone("+1 ");
    setSize("");
    setTime("");
    setErrors({});
    setSuccess("Reservation saved!");
    setTimeout(() => setSuccess(""), 3000);

    try {
      const result = await createReservation(newReservation);

      if (!result.success) {
        setError("Google Sheets failed to save. Refreshing latest data.");
        await refresh();
      }
    } catch (err) {
      setError("Google Sheets failed to save. Refreshing latest data.");
      await refresh();
    }
  };

  return (
    <div className="reservation-form">
      <div className="form-header">
        <div>
          <h3 className="form-title">Add Reservation</h3>
          <p className="form-subtitle">
            Adding for {selectedDate.toDateString()}
          </p>
        </div>
      </div>

      {error && (
        <div className="form-alert form-alert-error">
          {error}
          <br />
          Phone format must be: <strong>+1 720-123-4567</strong>
        </div>
      )}

      {success && (
        <div className="form-alert form-alert-success">{success}</div>
      )}

      <div className="form-grid">
        <label className="form-field">
          <span className="form-label">Full Name</span>
          <input
            className={`form-input ${errors.name ? "input-error" : ""}`}
            placeholder="Customer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Phone</span>
          <input
            type="tel"
            className={`form-input ${errors.phone ? "input-error" : ""}`}
            placeholder="+1 720-123-4567"
            value={phone}
            onChange={handlePhoneChange}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Party Size</span>
          <input
            type="number"
            min={1}
            className={`form-input ${errors.size ? "input-error" : ""}`}
            placeholder="Number of guests"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Time</span>
          <select
            className={`form-input ${errors.time ? "input-error" : ""}`}
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

      <button onClick={save} className="form-save-btn">
        Save Reservation
      </button>
    </div>
  );
};

export default ReservationForm;
