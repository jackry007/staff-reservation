// App.jsx
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { supabase } from "./supabaseClient";
import Calendar from "react-calendar";
import ReservationForm from "./ReservationForm";
import EditModal from "./EditModal";
import ConfirmModal from "./ConfirmModal";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";

<<<<<<< Updated upstream
/** Format date as YYYY-MM-DD using LOCAL time (prevents timezone bugs) */
=======
/** LOCAL date (YYYY-MM-DD). Prevents timezone bugs from toISOString(). */
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  return ymd < todayYMD();
=======
  return ymd < todayYMD(); // works for YYYY-MM-DD
>>>>>>> Stashed changes
}
function isTodayOrFutureYMD(ymd) {
  return ymd >= todayYMD();
}

function App() {
  const [user, setUser] = useState(null);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const selectedYMD = useMemo(() => toLocalYMD(selectedDate), [selectedDate]);

  const [reservations, setReservations] = useState([]);
  const [highlightedDates, setHighlightedDates] = useState([]);

  const [editRes, setEditRes] = useState(null);
  const [deleteResId, setDeleteResId] = useState(null);

<<<<<<< Updated upstream
  const [loading, setLoading] = useState(false);
=======
  const [loadingList, setLoadingList] = useState(false);
>>>>>>> Stashed changes
  const [loadingHighlights, setLoadingHighlights] = useState(false);
  const [error, setError] = useState("");

  const canModifySelectedDay = useMemo(
    () => isTodayOrFutureYMD(selectedYMD),
    [selectedYMD]
  );

<<<<<<< Updated upstream
=======
  const selectedIsPast = useMemo(() => isPastYMD(selectedYMD), [selectedYMD]);

>>>>>>> Stashed changes
  // ---- Auth ----
  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error(error);
      setUser(data?.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // ---- Data ----
  const fetchReservations = useCallback(async () => {
<<<<<<< Updated upstream
    setLoading(true);
=======
    setLoadingList(true);
>>>>>>> Stashed changes
    setError("");

    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("date", selectedYMD)
      .order("time", { ascending: true, nullsFirst: false });

    if (error) {
      console.error(error);
      setError(error.message || "Failed to load reservations.");
      setReservations([]);
    } else {
      setReservations(data || []);
    }

<<<<<<< Updated upstream
    setLoading(false);
=======
    setLoadingList(false);
>>>>>>> Stashed changes
  }, [selectedYMD]);

  const fetchHighlightedDates = useCallback(async () => {
    setLoadingHighlights(true);

    const { data, error } = await supabase.from("reservations").select("date");
    if (error) {
      console.error(error);
      setHighlightedDates([]);
    } else {
      const uniqueDates = [...new Set((data || []).map((r) => r.date))];
      setHighlightedDates(uniqueDates);
    }

    setLoadingHighlights(false);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchReservations(), fetchHighlightedDates()]);
  }, [fetchReservations, fetchHighlightedDates]);

  useEffect(() => {
    if (!user) return;
    fetchHighlightedDates();
  }, [user, fetchHighlightedDates]);

  useEffect(() => {
    if (!user) return;
    fetchReservations();
  }, [user, fetchReservations]);

  const deleteReservation = useCallback(
    async (id) => {
      if (!canModifySelectedDay) {
        setError("Past dates are locked. You can’t delete old reservations.");
        setDeleteResId(null);
        return;
      }

<<<<<<< Updated upstream
      setLoading(true);
=======
      setLoadingList(true);
>>>>>>> Stashed changes
      setError("");

      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(error);
        setError(error.message || "Failed to delete reservation.");
      } else {
        setDeleteResId(null);
        await refreshAll();
      }

<<<<<<< Updated upstream
      setLoading(false);
=======
      setLoadingList(false);
>>>>>>> Stashed changes
    },
    [canModifySelectedDay, refreshAll]
  );

  const totalSize = useMemo(
    () => reservations.reduce((sum, r) => sum + (Number(r.size) || 0), 0),
    [reservations]
  );

  if (!user) return <Login />;

  return (
    <div className="app-shell">
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div>
            <h1 className="app-title">Hiro Staff Reservation</h1>
            <p className="app-subtitle">
              Selected:{" "}
              <span className="text-strong">{selectedDate.toDateString()}</span>{" "}
<<<<<<< Updated upstream
              {isPastYMD(selectedYMD) ? (
=======
              {selectedIsPast ? (
>>>>>>> Stashed changes
                <span className="badge badge-danger">Past date locked</span>
              ) : (
                <span className="badge badge-success">Editable</span>
              )}
            </p>
          </div>

          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={refreshAll}
<<<<<<< Updated upstream
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => supabase.auth.signOut()}
=======
              disabled={loadingList}
              title="Refresh"
            >
              {loadingList ? "Refreshing…" : "Refresh"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => supabase.auth.signOut()}
              title="Sign out"
>>>>>>> Stashed changes
            >
              Sign out
            </button>
          </div>
        </header>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="grid-2">
          {/* Calendar */}
          <section className="card">
            <div className="card-header">
              <div className="card-title">Calendar</div>
              <div className="card-hint">
                {loadingHighlights ? "Loading…" : ""}
              </div>
            </div>

            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={({ date, view }) => {
                if (view !== "month") return null;

                const ymd = toLocalYMD(date);
                const classes = [];

                if (highlightedDates.includes(ymd))
                  classes.push("highlighted-date");
                if (isPastYMD(ymd)) classes.push("past-date");

                return classes.join(" ");
              }}
<<<<<<< Updated upstream
            />
          </section>

          {/* List */}
=======
              // Optional: if you want users to NOT even select past dates, enable this:
              // tileDisabled={({ date, view }) => view === "month" && isPastYMD(toLocalYMD(date))}
            />
          </section>

          {/* Reservations list */}
>>>>>>> Stashed changes
          <section className="card card-scroll">
            <div className="list-header">
              <h2 className="list-title">
                Reservations{" "}
                <span className="list-meta">
                  ({reservations.length} / {totalSize} people)
                </span>
              </h2>

              <span
                className={`badge ${
                  canModifySelectedDay ? "badge-success" : "badge-danger"
                }`}
              >
                {canModifySelectedDay ? "Edit enabled" : "Read-only"}
              </span>
            </div>

<<<<<<< Updated upstream
            {loading ? (
=======
            {loadingList ? (
>>>>>>> Stashed changes
              <div className="muted">Loading reservations…</div>
            ) : reservations.length === 0 ? (
              <div className="empty-box">No reservations yet for this day.</div>
            ) : (
              <ul className="res-list">
                {reservations.map((r) => {
<<<<<<< Updated upstream
                  const disableActions = loading || !canModifySelectedDay;
=======
                  const disableActions = loadingList || !canModifySelectedDay;
>>>>>>> Stashed changes

                  return (
                    <li key={r.id} className="res-row">
                      <div className="res-left">
                        <div className="res-main">
                          <span className="res-name">{r.name}</span>
                          <span className="pill">
                            {Number(r.size) || 0} ppl
                          </span>
                          {r.time ? (
                            <span className="pill pill-time">{r.time}</span>
                          ) : (
                            <span className="pill pill-muted">No time</span>
                          )}
                        </div>
                        <div className="res-sub">{r.phone}</div>
                      </div>

                      <div className="res-actions">
                        <button
                          className="btn btn-warn"
                          disabled={disableActions}
                          onClick={() => {
                            if (!canModifySelectedDay) {
                              setError(
                                "Past dates are locked. You can’t edit old reservations."
                              );
                              return;
                            }
                            setEditRes(r);
                          }}
                        >
                          Edit
                        </button>
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
                        <button
                          className="btn btn-danger"
                          disabled={disableActions}
                          onClick={() => {
                            if (!canModifySelectedDay) {
                              setError(
                                "Past dates are locked. You can’t delete old reservations."
                              );
                              return;
                            }
                            setDeleteResId(r.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

<<<<<<< Updated upstream
        {/* Add Form */}
        <section className="card mt-16">
=======
        {/* Add Reservation */}
        <section className="card mt-16 add-sheet">
>>>>>>> Stashed changes
          <div className="card-header">
            <div className="card-title">Add Reservation</div>
            {!canModifySelectedDay && (
              <span className="badge badge-danger">Locked for past dates</span>
            )}
          </div>

<<<<<<< Updated upstream
          {/* You must implement disabled in ReservationForm for full lock */}
=======
          {/* IMPORTANT: Your ReservationForm should use `disabled` to block submit */}
>>>>>>> Stashed changes
          <ReservationForm
            selectedDate={selectedDate}
            refresh={refreshAll}
            disabled={!canModifySelectedDay}
            selectedYMD={selectedYMD}
          />
        </section>

        {/* Modals */}
        {editRes && (
          <EditModal
            reservation={editRes}
            close={() => setEditRes(null)}
            refresh={refreshAll}
            disabled={!canModifySelectedDay}
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
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setWorking(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message || "Login failed.");
    setWorking(false);
  };

  return (
    <div className="login-shell">
      <form
        className="login-card"
        onSubmit={(e) => {
          e.preventDefault();
          login();
        }}
      >
        <div className="login-top">
          <div className="login-logo">H</div>
          <div>
            <h2 className="login-title">Admin Login</h2>
            <p className="login-sub">Staff-only access</p>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <label className="field">
          <span className="field-label">Email</span>
          <div className="field-control">
            <span className="field-icon">📧</span>
            <input
              className="login-input"
              placeholder="name@hiro.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
            />
          </div>
        </label>

        <label className="field">
          <span className="field-label">Password</span>
          <div className="field-control">
            <span className="field-icon">🔒</span>
            <input
              className="login-input"
              placeholder="••••••••"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="field-btn"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button
          className="btn btn-primary w-full"
          type="submit"
          disabled={working}
        >
          {working ? "Signing in…" : "Sign In"}
        </button>

        <p className="login-foot">
<<<<<<< Updated upstream
          Tip: If it fails, double-check the Supabase user exists + password is
=======
          Tip: If it fails, confirm the Supabase user exists and the password is
>>>>>>> Stashed changes
          correct.
        </p>
      </form>
    </div>
  );
}

export default App;
