// ReservationForm.jsx
import React, { useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

/** LOCAL date (YYYY-MM-DD) – prevents timezone issues */
function toLocalYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function todayYMD() {
  return toLocalYMD(new Date());
}
function isPastYMD(ymd) {
  return ymd < todayYMD();
}

/** Generate slots like "11:00 AM" ... "9:00 PM" */
function generateTimeSlots({
  startHour24,
  startMinute,
  endHour24,
  endMinute,
  stepMinutes,
}) {
  const slots = [];
  let cur = startHour24 * 60 + startMinute;
  const end = endHour24 * 60 + endMinute;

  while (cur <= end) {
    const h24 = Math.floor(cur / 60);
    const min = cur % 60;

    const isPM = h24 >= 12;
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;

    const label = `${h12}:${String(min).padStart(2, "0")} ${isPM ? "PM" : "AM"
      }`;
    slots.push(label);

    cur += stepMinutes;
  }

  return slots;
}

/**
 * Phone helpers
 * - store digits only: "7201234567"
 * - display formatted: "+1 720-123-4567"
 */
function onlyDigits(s) {
  return (s || "").replace(/\D/g, "");
}
function normalizeUS10(digits) {
  // allow pasting with leading 1 -> drop it
  const d = onlyDigits(digits);
  if (d.length === 11 && d.startsWith("1")) return d.slice(1, 11);
  return d.slice(0, 10);
}
function formatUS10(d10) {
  const d = normalizeUS10(d10);
  if (!d) return ""; // IMPORTANT: allow blank so backspace works naturally

  // build "+1 XXX-XXX-XXXX" progressively
  let out = "+1 ";
  if (d.length <= 3) return out + d;
  if (d.length <= 6) return out + d.slice(0, 3) + "-" + d.slice(3);
  return out + d.slice(0, 3) + "-" + d.slice(3, 6) + "-" + d.slice(6);
}

const ReservationForm = ({ selectedDate, refresh, disabled: disabledProp }) => {
  const dateYMD = useMemo(() => toLocalYMD(selectedDate), [selectedDate]);
  const locked = useMemo(() => isPastYMD(dateYMD), [dateYMD]);
  const disabled = Boolean(disabledProp) || locked;

  // Slots: 11:00 AM to 9:00 PM every 30 min
  const timeSlots = useMemo(
    () =>
      generateTimeSlots({
        startHour24: 11,
        startMinute: 0,
        endHour24: 21,
        endMinute: 0,
        stepMinutes: 30,
      }),
    []
  );

  const [name, setName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState(""); // store digits only
  const [sizeText, setSizeText] = useState("1");
  const [time, setTime] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const phoneDisplay = useMemo(() => formatUS10(phoneDigits), [phoneDigits]);

  const size = useMemo(() => {
    // keep it strict, but don’t coerce weird stuff
    const n = Number(sizeText);
    return Number.isFinite(n) ? n : NaN;
  }, [sizeText]);

  const canSave = useMemo(() => {
    if (disabled || saving) return false;
    if (!name.trim()) return false;
    if (!Number.isFinite(size) || size < 1) return false;
    if (normalizeUS10(phoneDigits).length !== 10) return false;
    if (!time) return false;
    return true;
  }, [disabled, saving, name, size, phoneDigits, time]);

  const save = async () => {
    setError("");
    setSuccess("");

    if (disabled) {
      setError("This date is locked. You can’t add reservations to past days.");
      return;
    }

    const cleanedName = name.trim();
    const d10 = normalizeUS10(phoneDigits);
    const formattedPhone = formatUS10(d10);

    if (!cleanedName) return setError("Name is required.");
    if (!Number.isFinite(size) || size < 1)
      return setError("Party size must be at least 1.");
    if (d10.length !== 10)
      return setError("Phone must be a valid US number (10 digits).");
    if (!time) return setError("Please select a time.");

    setSaving(true);

    const { error } = await supabase.from("reservations").insert({
      name: cleanedName,
      phone: formattedPhone, // store formatted string
      size, // store number
      time, // store label like "5:30 PM"
      date: dateYMD,
    });

    setSaving(false);

    if (error) {
      setError(error.message || "Failed to save reservation.");
      return;
    }

    setName("");
    setPhoneDigits("");
    setSizeText("1");
    setTime("");
    setSuccess("✅ Reservation saved!");
    await refresh();

    setTimeout(() => setSuccess(""), 2500);
  };

  return (
    <div>
      {locked && (
        <div className="alert alert-danger" style={{ marginTop: 0 }}>
          Past dates are locked — you can view them but not add reservations.
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {success && (
        <div
          className="alert"
          style={{
            background: "rgba(34,197,94,0.12)",
            borderColor: "rgba(34,197,94,0.35)",
            color: "#bbf7d0",
            fontWeight: 900,
          }}
        >
          {success}
        </div>
      )}

      <div className="modal-grid" style={{ marginTop: 10 }}>
        <label className="modal-field">
          <span className="modal-label">Name</span>
          <input
            className="modal-input"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled}
          />
        </label>

        <label className="modal-field">
          <span className="modal-label">Phone</span>
          <input
            className="modal-input"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="+1 720-123-4567"
            value={phoneDisplay}
            onChange={(e) => {
              // allow full deletion & normal backspace
              const d10 = normalizeUS10(e.target.value);
              setPhoneDigits(d10);
            }}
            disabled={disabled}
          />
        </label>

        <label className="modal-field">
          <span className="modal-label">Party size</span>
          <input
            className="modal-input"
            type="number"
            min={1}
            step={1}
            value={sizeText}
            onChange={(e) => setSizeText(e.target.value)}
            disabled={disabled}
          />
        </label>

        <label className="modal-field">
          <span className="modal-label">Time</span>
          <select
            className="modal-input"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={disabled}
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

      <div style={{ marginTop: 12 }}>
        <button
          className="btn btn-primary w-full"
          onClick={save}
          disabled={!canSave}
        >
          {saving ? "Saving…" : "Save Reservation"}
        </button>

        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "rgba(156,163,175,1)",
            textAlign: "center",
          }}
        >
          Date:{" "}
          <strong style={{ color: "rgba(229,231,235,1)" }}>{dateYMD}</strong>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;
