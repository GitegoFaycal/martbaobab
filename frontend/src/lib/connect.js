// Records a buyer-to-seller connection when someone taps WhatsApp or call.
// Fire-and-forget: the chat opens regardless of whether the request lands.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const VISITOR_KEY = "loco.visitor";

export function visitorKey() {
  try {
    let key = localStorage.getItem(VISITOR_KEY);
    if (!key) {
      key = (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48);
      localStorage.setItem(VISITOR_KEY, key);
    }
    return key;
  } catch {
    return "";
  }
}

export function recordConnection({ listingId, personId, channel = "WHATSAPP" }) {
  const body = JSON.stringify({ listingId, personId, channel });

  try {
    fetch(`${API_URL}/connections`, {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: { "Content-Type": "application/json", "x-loco-visitor": visitorKey() },
      body,
    }).catch(() => {});
  } catch {
    // Ignore: analytics must never block the user.
  }
}
