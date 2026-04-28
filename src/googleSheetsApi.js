const SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbwZKQ5uQFx9Caa8X6lQN2HhVNma4g4KaNyygiPlrzLlTFWmtbt7aJ3l7Zg5MqgdySL4/exec";

export async function getReservations() {
  const res = await fetch(SHEETS_API_URL);
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch reservations");
  }

  return data.reservations;
}

export async function createReservation(reservation) {
  const newReservation = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    status: "active", 
    notes: "",
    ...reservation,
  };

  const res = await fetch(SHEETS_API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "create",
      reservation: newReservation,
    }),
  });

  return res.json();
}

export async function updateReservation(id, reservation) {
  const res = await fetch(SHEETS_API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "update",
      id,
      reservation,
    }),
  });

  return res.json();
}

export async function deleteReservation(id) {
  const res = await fetch(SHEETS_API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "delete",
      id,
    }),
  });

  return res.json();
}
