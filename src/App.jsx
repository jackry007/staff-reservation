// App.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import ReservationForm from "./ReservationForm";
import EditModal from "./EditModal";
import ConfirmModal from "./ConfirmModal";
import {
  getReservations,
  deleteReservation as deleteReservationFromSheet,
} from "./googleSheetsApi";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [editRes, setEditRes] = useState(null);
  const [deleteResId, setDeleteResId] = useState(null);
  const [highlightedDates, setHighlightedDates] = useState([]);

  const formatDateLocal = (date) => {
    return date.toLocaleDateString("en-CA");
  };

  const normalizeDate = (dateValue) => {
    return String(dateValue || "").split("T")[0];
  };

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

  const rebuildHighlightedDates = (data) => {
    return [...new Set(data.map((r) => normalizeDate(r.date)).filter(Boolean))];
  };

  const loadAllData = async () => {
    const data = await getReservations();
    setAllReservations(data);
    setHighlightedDates(rebuildHighlightedDates(data));
  };

  const filterReservationsForSelectedDate = () => {
    const selectedIso = formatDateLocal(selectedDate);

    const filtered = allReservations.filter((r) => {
      return normalizeDate(r.date) === selectedIso;
    });

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
        r.id === updatedReservation.id
          ? {
              ...r,
              ...updatedReservation,
            }
          : r,
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

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    return target < today;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans text-gray-200 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-white">
        Hiro Staff Reservation
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg w-full md:w-1/2">
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

        <div className="bg-gray-800 p-4 rounded-xl shadow-lg w-full md:w-1/2 overflow-y-auto max-h-[500px]">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Reservations for {selectedDate.toDateString()} ({totalSize} people)
          </h2>

          <ul className="space-y-3">
            {reservations.map((r) => {
              const isPast = isPastDate(normalizeDate(r.date));

              return (
                <li
                  key={r.id}
                  className={`p-3 rounded shadow flex justify-between items-center ${
                    isPast ? "bg-gray-600 opacity-60" : "bg-gray-700"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">
                      {r.name} ({r.size} ppl)
                    </div>

                    <div className="text-sm text-gray-400 flex flex-col">
                      <span>{r.phone}</span>

                      {r.time && (
                        <span className="text-yellow-400 font-medium">
                          {formatTime(r.time)}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isPast && (
                    <div className="space-x-2">
                      <button
                        onClick={() => setEditRes(r)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setDeleteResId(r.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-gray-800 p-4 rounded-xl shadow-lg">
        <ReservationForm
          selectedDate={selectedDate}
          refresh={refreshData}
          addReservationLocal={addReservationLocal}
        />
      </div>

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
  );
}

export default App;
