// App.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Calendar from "react-calendar";
import ReservationForm from "./ReservationForm";
import EditModal from "./EditModal";
import ConfirmModal from "./ConfirmModal";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";

function App() {
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [editRes, setEditRes] = useState(null);
  const [deleteResId, setDeleteResId] = useState(null);
  const [highlightedDates, setHighlightedDates] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    if (user) {
      fetchReservations();
      fetchHighlightedDates();
    }
  }, [selectedDate, user]);

  const fetchReservations = async () => {
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .eq("date", selectedDate.toISOString().split("T")[0]);
    setReservations(data || []);
  };

  const fetchHighlightedDates = async () => {
    const { data } = await supabase.from("reservations").select("date");
    if (data) {
      const uniqueDates = [...new Set(data.map((r) => r.date))];
      setHighlightedDates(uniqueDates);
    }
  };

  const deleteReservation = async (id) => {
    await supabase.from("reservations").delete().eq("id", id);
    fetchReservations();
    setDeleteResId(null);
  };

  const totalSize = reservations.reduce((sum, r) => sum + r.size, 0);

  if (!user) return <Login />;

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans text-gray-200 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-white">Hiro Staff Reservation</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Calendar */}
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg w-full md:w-1/2">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={({ date, view }) => {
              if (
                view === "month" &&
                highlightedDates.includes(date.toISOString().split("T")[0])
              ) {
                return "highlighted-date";
              }
              return null;
            }}
          />
        </div>

        {/* Right Column: Reservation Summary */}
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg w-full md:w-1/2 overflow-y-auto max-h-[500px]">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Reservations for {selectedDate.toDateString()} ({totalSize} people)
          </h2>
          <ul className="space-y-3">
            {reservations.map((r) => (
              <li
                key={r.id}
                className="bg-gray-700 p-3 rounded shadow flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-white">
                    {r.name} ({r.size} ppl)
                  </div>
                  <div className="text-sm text-gray-400 flex flex-col">
                    <span>{r.phone}</span>
                    {r.time && (
                      <span className="text-yellow-400 font-medium">{r.time}</span>
                    )}
                  </div>
                </div>
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
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-gray-800 p-4 rounded-xl shadow-lg">
        <ReservationForm selectedDate={selectedDate} refresh={fetchReservations} />
      </div>

      {editRes && (
        <EditModal
          reservation={editRes}
          close={() => setEditRes(null)}
          refresh={fetchReservations}
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

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    await supabase.auth.signInWithPassword({ email, password });
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl mb-4 font-semibold">Admin Login</h2>
      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-4"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={login} className="bg-blue-600 text-white px-4 py-2 rounded">
        Login
      </button>
    </div>
  );
}

export default App;
