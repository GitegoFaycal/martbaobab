import { LocateFixed, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buildQuery } from "../api/api";
import useFetch from "../hooks/useFetch";
import { useT } from "../i18n";

// Leaflet + OpenStreetMap tiles, loaded from a CDN the first time a map is
// shown so the rest of the app never pays for it.
const LEAFLET_VERSION = "1.9.4";
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const KIGALI = { lat: -1.9441, lng: 30.0619 };

let leafletPromise = null;
export function loadLeaflet() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.L) return Promise.resolve(window.L);
  leafletPromise ??= new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("leaflet failed to load"));
    document.head.appendChild(script);
  });
  return leafletPromise;
}

function pinIcon(L) {
  return L.divIcon({
    className: "",
    html: '<div style="width:20px;height:20px;border-radius:50%;background:#1e7ff5;border:3px solid #fff;box-shadow:0 0 0 2px #0b2a6f"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Draggable pin. `place` (district/sector/cell) centres the map when there is
// no pin yet; `value` is {lat,lng} or null; `onChange` gets {lat,lng} or null.
export function MapPicker({ place, value, onChange, className = "" }) {
  const t = useT();
  const box = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const hasPlace = Boolean(place?.district);
  const { data: centreData } = useFetch(`/whereami/centre${buildQuery({ district: place?.district, sector: place?.sector, cell: place?.cell })}`, { enabled: hasPlace });
  const centre = centreData?.centre || null;

  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !box.current || mapRef.current) return;
        const start = value || centre || KIGALI;
        const map = L.map(box.current, { zoomControl: true, attributionControl: true }).setView([start.lat, start.lng], value ? 16 : centre ? 14 : 12);
        L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
        mapRef.current = map;

        function placeMarker(latlng) {
          if (!markerRef.current) {
            markerRef.current = L.marker(latlng, { draggable: true, icon: pinIcon(L) }).addTo(map);
            markerRef.current.on("dragend", () => {
              const p = markerRef.current.getLatLng();
              onChange({ lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) });
            });
          } else {
            markerRef.current.setLatLng(latlng);
          }
        }
        if (value) placeMarker([value.lat, value.lng]);
        map.on("click", (event) => {
          placeMarker(event.latlng);
          onChange({ lat: +event.latlng.lat.toFixed(6), lng: +event.latlng.lng.toFixed(6) });
        });
        setReady(true);
      })
      .catch(() => setError(t("geo.mapFailed")));
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recentre on the chosen place while there is no pin.
  useEffect(() => {
    if (mapRef.current && centre && !value) mapRef.current.setView([centre.lat, centre.lng], 14);
  }, [centre, value]);

  // Keep the marker in sync when the value is set from outside (GPS button).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.L) return;
    if (value) {
      if (!markerRef.current) {
        markerRef.current = window.L.marker([value.lat, value.lng], { draggable: true, icon: pinIcon(window.L) }).addTo(map);
        markerRef.current.on("dragend", () => {
          const p = markerRef.current.getLatLng();
          onChange({ lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) });
        });
      } else {
        markerRef.current.setLatLng([value.lat, value.lng]);
      }
      map.setView([value.lat, value.lng], Math.max(map.getZoom(), 15));
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  function useDevice() {
    if (!navigator.geolocation) { setError(t("geo.unsupported")); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => onChange({ lat: +position.coords.latitude.toFixed(6), lng: +position.coords.longitude.toFixed(6) }),
      () => setError(t("geo.denied")),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  return (
    <div className={className}>
      <div ref={box} className="h-64 w-full overflow-hidden rounded-2xl border border-blue-100 bg-loco-ice" />
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <button type="button" onClick={useDevice} className="inline-flex items-center gap-1.5 rounded-full bg-loco-blue px-3 py-1.5 font-bold text-white hover:bg-loco-blue-dark"><LocateFixed size={14} /> {t("geo.pinHere")}</button>
        {value && <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-white px-3 py-1.5 font-bold text-loco-navy hover:bg-loco-ice"><X size={13} /> {t("geo.clearPin")}</button>}
        <span className="text-gray-500">{value ? t("geo.pinSet", { lat: value.lat.toFixed(4), lng: value.lng.toFixed(4) }) : ready ? t("geo.pinHint") : t("common.loading")}</span>
        {error && <span className="font-semibold text-red-600">{error}</span>}
      </div>
    </div>
  );
}

// Read-only map with one pin, for shop pages.
export function StaticMap({ lat, lng, zoom = 15, className = "" }) {
  const box = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !box.current || mapRef.current) return;
      const map = L.map(box.current, { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false }).setView([lat, lng], zoom);
      L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
      L.marker([lat, lng], { icon: pinIcon(L), interactive: false }).addTo(map);
      mapRef.current = map;
    }).catch(() => {});
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [lat, lng, zoom]);

  return <div ref={box} className={`h-56 w-full overflow-hidden rounded-2xl bg-loco-ice ${className}`} />;
}
