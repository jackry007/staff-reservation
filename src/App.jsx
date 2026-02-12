// App.jsx
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { supabase } from "./supabaseClient";
import Calendar from "react-calendar";
import ReservationForm from "./ReservationForm";
import EditModal from "./EditModal";
import ConfirmModal from "./ConfirmModal";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";

/** LOCAL date (YYYY-MM-DD). Prevents timezone bugs from toISOString(). */
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
  return ymd < todayYMD(); // works for YYYY-MM-DD
}
function isTodayOrFutureYMD(ymd) {
  return ymd >= todayYMD();
}
function buildGoogleCalendarUrl11AM({ name, size, phone, dateYMD, timeLabel }) {
  const startLocal = new Date(`${dateYMD}T11:00:00`);
  const endLocal = new Date(`${dateYMD}T11:15:00`);

  const toGCalLocal = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      "00"
    );
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Hiro Reminder — ${name} (${Number(size) || 0} ppl)`,
    dates: `${toGCalLocal(startLocal)}/${toGCalLocal(endLocal)}`,
    details: `Reservation time: ${timeLabel || "N/A"}\nPhone: ${phone || ""
      }\n\n(10:00 AM reminder created from Hiro Staff Reservation)`,
    location: "Hiro Japanese Buffet",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}


function App() {
  const [user, setUser] = useState(null);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const selectedYMD = useMemo(() => toLocalYMD(selectedDate), [selectedDate]);

  const [reservations, setReservations] = useState([]);
  const [highlightedDates, setHighlightedDates] = useState([]);

  const [editRes, setEditRes] = useState(null);
  const [deleteResId, setDeleteResId] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingHighlights, setLoadingHighlights] = useState(false);
  const [error, setError] = useState("");

  const canModifySelectedDay = useMemo(
    () => isTodayOrFutureYMD(selectedYMD),
    [selectedYMD]
  );

  const selectedIsPast = useMemo(() => isPastYMD(selectedYMD), [selectedYMD]);

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
    setLoadingList(true);
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

    setLoadingList(false);
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

      setLoadingList(true);
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

      setLoadingList(false);
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
              {selectedIsPast ? (
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
              disabled={loadingList}
              title="Refresh"
            >
              {loadingList ? "Refreshing…" : "Refresh"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => supabase.auth.signOut()}
              title="Sign out"
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
            // Optional:
            // tileDisabled={({ date, view }) => view === "month" && isPastYMD(toLocalYMD(date))}
            />
          </section>

          {/* Reservations list */}
          <section className="card card-scroll">
            <div className="list-header">
              <h2 className="list-title">
                Reservations{" "}
                <span className="list-meta">
                  ({reservations.length} / {totalSize} people)
                </span>
              </h2>

              <span
                className={`badge ${canModifySelectedDay ? "badge-success" : "badge-danger"
                  }`}
              >
                {canModifySelectedDay ? "Edit enabled" : "Read-only"}
              </span>
            </div>

            {loadingList ? (
              <div className="muted">Loading reservations…</div>
            ) : reservations.length === 0 ? (
              <div className="empty-box">No reservations yet for this day.</div>
            ) : (
              <ul className="res-list">
                {reservations.map((r) => {
                  const disableActions = loadingList || !canModifySelectedDay;

                  const calUrl =
                    buildGoogleCalendarUrl11AM({
                      name: r.name,
                      size: r.size,
                      phone: r.phone,
                      dateYMD: selectedYMD,
                      timeLabel: r.time,
                    });

                  return (
                    <li key={r.id} className="res-row">
                      <div className="res-left">
                        <div className="res-main">
                          <div className="res-main">
                            <span className="res-title">
                              {r.time || "No time"} – {r.name} ({Number(r.size) || 0}{" "}
                              {Number(r.size) === 1 ? "person" : "people"})
                            </span>
                          </div>
                        </div>
                        <div className="res-sub">{r.phone}</div>
                      </div>

                      <div className="res-actions">
                        {/* Add to Calendar */}
                        {calUrl && (
                          <a
                            className="btn btn-secondary"
                            href={calUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Add to Google Calendar"
                            style={{ textDecoration: "none" }}
                          >
                            Add to Calendar
                          </a>
                        )}

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

        {/* Add Reservation */}
        <section className="card mt-16 add-sheet">
          <div className="card-header">
            <div className="card-title">Add Reservation</div>
            {!canModifySelectedDay && (
              <span className="badge badge-danger">Locked for past dates</span>
            )}
          </div>

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
          Tip: If it fails, confirm the Supabase user exists and the password is
          correct.
        </p>
      </form>
    </div>
  );
}

export default App;
