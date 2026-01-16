// EditModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

/** Format date as YYYY-MM-DD using LOCAL time (timezone-safe) */
function toLocalYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isPastYMD(ymd) {
  return ymd < toLocalYMD(new Date());
}

const normalizePhone = (value) => value.replace(/[^\d]/g, "").slice(0, 10);

const EditModal = ({ reservation, close, refresh }) => {
  const [name, setName] = useState(reservation?.name || "");
  const [phone, setPhone] = useState(reservation?.phone || "");
  const [size, setSize] = useState(Number(reservation?.size) || 1);
  const [time, setTime] = useState(reservation?.time || ""); // NEW (optional)

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dateYMD = reservation?.date; // should already be YYYY-MM-DD in DB

  const locked = useMemo(() => {
    if (!dateYMD) return false;
    return isPastYMD(dateYMD); // Past only is locked — today is allowed
  }, [dateYMD]);

  const canSave = useMemo(() => {
    if (locked) return false;
    if (!name.trim()) return false;
    if (size < 1) return false;
    return true;
  }, [locked, name, size]);

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  // Prevent background scroll while modal open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSave = async () => {
    if (locked) {
      setError("Past dates are locked. You can’t edit old reservations.");
      return;
    }

    const cleanedName = name.trim();
    const cleanedPhone = phone.trim();
    const cleanedSize = Number(size);

    if (!cleanedName) {
      setError("Name is required.");
      return;
    }
    if (!Number.isFinite(cleanedSize) || cleanedSize < 1) {
      setError("Party size must be at least 1.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("reservations")
      .update({
        name: cleanedName,
        phone: cleanedPhone,
        size: cleanedSize,
        time: time || null, // keep null if empty
        date: reservation.date, // unchanged
      })
      .eq("id", reservation.id);

    setSaving(false);

    if (error) {
      setError(error.message || "Failed to update reservation.");
      return;
    }

    await refresh();
    close();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Edit reservation"
      onMouseDown={(e) => {
        // Click outside closes
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <h3 className="modal-title">Edit Reservation</h3>
            <p className="modal-sub">
              Date: <span className="modal-strong">{dateYMD || "—"}</span>
              {locked ? (
                <span className="modal-badge danger">Past date locked</span>
              ) : (
                <span className="modal-badge ok">Editable</span>
              )}
            </p>
          </div>

          <button className="icon-btn" onClick={close} aria-label="Close">
            ✕
          </button>
        </div>

        {error && <div className="modal-alert">{error}</div>}

        <div className="modal-grid">
          <label className="modal-field">
            <span className="modal-label">Name</span>
            <input
              className="modal-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={locked || saving}
              placeholder="Customer name"
              autoFocus
            />
          </label>

          <label className="modal-field">
            <span className="modal-label">Phone</span>
            <input
              className="modal-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={locked || saving}
              placeholder="(123) 456-7890"
              inputMode="tel"
            />
          </label>

          <label className="modal-field">
            <span className="modal-label">Party size</span>
            <input
              className="modal-input"
              type="number"
              min={1}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              disabled={locked || saving}
            />
          </label>

          <label className="modal-field">
            <span className="modal-label">Time (optional)</span>
            <input
              className="modal-input"
              type="time"
              value={time || ""}
              onChange={(e) => setTime(e.target.value)}
              disabled={locked || saving}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button
            className="modal-btn secondary"
            onClick={close}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="modal-btn primary"
            onClick={handleSave}
            disabled={!canSave || saving}
            title={!canSave ? "Fill required fields" : "Save changes"}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        {locked && (
          <p className="modal-note">
            Past dates are read-only to protect records.
          </p>
        )}
      </div>
    </div>
  );
};

export default EditModal;
