// Finding the visitor's place. Everything stays on this device: the place is
// kept in localStorage and never attached to the account.
import { apiRequest } from "../api/api";
import { EMPTY_LOCATION, getSavedLocation, saveLocation } from "./locations";

const SOURCE_KEY = "loco.locationSource"; // "gps" | "ip" | "manual"
const COORDS_KEY = "loco.coords";

export function getSavedCoords() {
  try {
    const raw = localStorage.getItem(COORDS_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    return Number.isFinite(c.lat) && Number.isFinite(c.lng) ? { lat: c.lat, lng: c.lng } : null;
  } catch {
    return null;
  }
}

export function saveCoords(coords) {
  try {
    if (coords) localStorage.setItem(COORDS_KEY, JSON.stringify({ lat: coords.lat, lng: coords.lng, at: Date.now() }));
    else localStorage.removeItem(COORDS_KEY);
  } catch {
    // ignore
  }
}

// "lat,lng" for ?near=, only when it makes sense: the device has GPS
// coordinates and the visitor is not browsing a different district on purpose.
export function nearFor(place) {
  const coords = getSavedCoords();
  if (!coords) return null;
  if (place?.district && place.district !== getSavedLocation().district) return null;
  return `${coords.lat.toFixed(5)},${coords.lng.toFixed(5)}`;
}

export function getLocationSource() {
  try {
    return localStorage.getItem(SOURCE_KEY) || "";
  } catch {
    return "";
  }
}

export function setLocationSource(source) {
  try {
    if (source) localStorage.setItem(SOURCE_KEY, source);
    else localStorage.removeItem(SOURCE_KEY);
  } catch {
    // ignore
  }
}

// Coarse place from the network, no permission needed. Resolves to a place
// or null; never throws.
export async function detectByNetwork() {
  try {
    const response = await apiRequest("/whereami");
    if (response.place?.district) {
      const place = { ...EMPTY_LOCATION, ...response.place };
      saveLocation(place);
      setLocationSource("ip");
      return place;
    }
  } catch {
    // Offline or API down: stay silent.
  }
  return null;
}

// Precise place from the device's GPS. Rejects with a short reason code:
// "unsupported" | "denied" | "unavailable" | "timeout" | "outside" | "failed".
export function detectByDevice() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await apiRequest(`/whereami?lat=${latitude.toFixed(5)}&lng=${longitude.toFixed(5)}`);
          if (!response.place?.district) {
            reject(new Error(response.reason === "outside_rwanda" ? "outside" : "failed"));
            return;
          }
          const place = { ...EMPTY_LOCATION, ...response.place };
          saveLocation(place);
          saveCoords({ lat: latitude, lng: longitude });
          setLocationSource("gps");
          resolve(place);
        } catch {
          reject(new Error("failed"));
        }
      },
      (error) => {
        const reason = error.code === 1 ? "denied" : error.code === 3 ? "timeout" : "unavailable";
        reject(new Error(reason));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5 * 60 * 1000 }
    );
  });
}
