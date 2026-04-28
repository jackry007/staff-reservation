// App.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import ReservationForm from "./ReservationForm";
import EditModal from "./EditModal";
import ConfirmModal from "./ConfirmModal";
import LoadingScreen from "./LoadingScreen";

import {
  getReservations,
  deleteReservation as deleteReservationFromSheet,
} from "./googleSheetsApi";
import "react-calendar/dist/Calendar.css";
import "./App.css";
import "./calendar.css";

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [editRes, setEditRes] = useState(null);
  const [deleteResId, setDeleteResId] = useState(null);
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDateLocal = (date) => date.toLocaleDateString("en-CA");

  const normalizeDate = (dateValue) => String(dateValue || "").split("T")[0];

  const formatTime = (timeValue) => {
    if (!timeValue) return "";

    const raw = String(timeValue);

    if (raw.includes("T")) {
      const date = new Date(raw);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      });
    }

    return raw;
  };

  const formatPhone = (phoneValue) => {
    const digits = String(phoneValue || "").replace(/\D/g, "");
    let tenDigits = digits;

    if (digits.length === 11 && digits.startsWith("1")) {
      tenDigits = digits.slice(1);
    }

    if (tenDigits.length === 10) {
      return `+1 ${tenDigits.slice(0, 3)}-${tenDigits.slice(
        3,
        6,
      )}-${tenDigits.slice(6)}`;
    }

    return phoneValue || "";
  };

  const rebuildHighlightedDates = (data) => [
    ...new Set(data.map((r) => normalizeDate(r.date)).filter(Boolean)),
  ];

  const loadAllData = async () => {
    setLoading(true);

    const data = await getReservations();

    setAllReservations(data);
    setHighlightedDates(rebuildHighlightedDates(data));

    setTimeout(() => {
      setLoading(false);
    }, 100); 
  };

  const filterReservationsForSelectedDate = () => {
    const selectedIso = formatDateLocal(selectedDate);

    const filtered = allReservations.filter(
      (r) => normalizeDate(r.date) === selectedIso,
    );

    setReservations(filtered);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    filterReservationsForSelectedDate();
  }, [selectedDate, allReservations]);

  const refreshData = async () => {
    await loadAllData();
  };

  const updateReservationLocal = (updatedReservation) => {
    setAllReservations((prev) =>
      prev.map((r) =>
        r.id === updatedReservation.id ? { ...r, ...updatedReservation } : r,
      ),
    );
  };

  const addReservationLocal = (newReservation) => {
    setAllReservations((prev) => {
      const next = [...prev, newReservation];
      setHighlightedDates(rebuildHighlightedDates(next));
      return next;
    });
  };

  const deleteReservationLocal = (id) => {
    setAllReservations((prev) => {
      const next = prev.filter((r) => r.id !== id);
      setHighlightedDates(rebuildHighlightedDates(next));
      return next;
    });
  };

  const deleteReservation = async (id) => {
    const oldReservations = allReservations;

    deleteReservationLocal(id);
    setDeleteResId(null);

    try {
      const result = await deleteReservationFromSheet(id);

      if (!result.success) {
        alert("Google Sheets failed to delete. Restoring latest data.");
        setAllReservations(oldReservations);
        setHighlightedDates(rebuildHighlightedDates(oldReservations));
        await refreshData();
      }
    } catch (error) {
      alert("Google Sheets failed to delete. Restoring latest data.");
      setAllReservations(oldReservations);
      setHighlightedDates(rebuildHighlightedDates(oldReservations));
      await refreshData();
    }
  };

  const totalSize = reservations.reduce(
    (sum, r) => sum + Number(r.size || 0),
    0,
  );
  if (loading) {
    return <LoadingScreen />;
  }

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    return target < today;
  };

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="app-header">
          <div>
            <h1 className="app-title">Hiro Staff Reservation</h1>
            <p className="app-subtitle">
              View, add, edit, and manage reservations.
            </p>
          </div>
        </header>

        <section className="grid-2">
          <div className="card">
            <Calendar
              onChange={(date) => setSelectedDate(date)}
              value={selectedDate}
              tileClassName={({ date, view }) => {
                const iso = formatDateLocal(date);

                if (view === "month") {
                  if (highlightedDates.includes(iso)) {
                    return isPastDate(date)
                      ? "highlighted-date past-date"
                      : "highlighted-date";
                  }

                  if (isPastDate(date)) {
                    return "past-date";
                  }
                }

                return null;
              }}
            />
          </div>

          <div className="card card-scroll">
            <h2 className="list-title">
              Reservations for {selectedDate.toDateString()}
            </h2>
            <p className="list-meta">{totalSize} people total</p>

            {reservations.length === 0 ? (
              <div className="empty-box">No reservations for this date.</div>
            ) : (
              <ul className="res-list">
                {reservations.map((r) => {
                  const isPast = isPastDate(normalizeDate(r.date));

                  return (
                    <li key={r.id} className="res-row">
                      <div className="res-left">
                        <div className="res-main">
                          <span className="res-name">{r.name}</span>
                          <span className="pill">{r.size} ppl</span>
                          {isPast && (
                            <span className="badge badge-danger">Past</span>
                          )}
                        </div>

                        <div className="res-sub">
                          <div>{formatPhone(r.phone)}</div>
                          {r.time && (
                            <div className="pill pill-time">
                              {formatTime(r.time)}
                            </div>
                          )}
                        </div>
                      </div>

                      {!isPast && (
                        <div className="res-actions">
                          <button
                            onClick={() => setEditRes(r)}
                            className="btn btn-warn"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => setDeleteResId(r.id)}
                            className="btn btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="card mt-16">
          <ReservationForm
            selectedDate={selectedDate}
            refresh={refreshData}
            addReservationLocal={addReservationLocal}
          />
        </section>

        {editRes && (
          <EditModal
            reservation={{
              ...editRes,
              date: normalizeDate(editRes.date),
              time: formatTime(editRes.time),
            }}
            close={() => setEditRes(null)}
            refresh={refreshData}
            updateReservationLocal={updateReservationLocal}
          />
        )}

        {deleteResId && (
          <ConfirmModal
            message="Are you sure you want to delete this reservation?"
            onConfirm={() => deleteReservation(deleteResId)}
            onCancel={() => setDeleteResId(null)}
          />
        )}
      </div>
    </main>
  );
}

export default App;


