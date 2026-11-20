import { LoaderCircle, LocateFixed, MapPin, X } from "lucide-react";
import { useState } from "react";
import { useT } from "../i18n";
import { detectByDevice, getLocationSource, setLocationSource } from "../lib/geo";
import { EMPTY_LOCATION, locationLabel, saveLocation } from "../lib/locations";

// "Use my location" pill. Shows the current place when one is known, with a
// locate action to refine it from GPS and a clear action to forget it.
export default function UseMyLocation({ place, onChange, className = "" }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const source = getLocationSource();
  const known = Boolean(place?.district);

  async function locate() {
    setBusy(true);
    setError("");
    try {
      const next = await detectByDevice();
      onChange(next);
    } catch (reason) {
      setError(t(`geo.${["denied", "unsupported", "outside", "timeout", "unavailable"].includes(reason.message) ? reason.message : "failed"}`));
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    saveLocation(EMPTY_LOCATION);
    setLocationSource("");
    setError("");
    onChange({ ...EMPTY_LOCATION });
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {known ? (
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-100 bg-loco-ice px-3 py-2 text-sm font-bold text-loco-navy">
          <MapPin size={15} className="shrink-0 text-loco-blue" />
          <span className="truncate">{t("geo.near", { place: locationLabel(place) })}</span>
          {source === "ip" && <span className="hidden text-[11px] font-semibold text-gray-500 sm:inline">· {t("geo.approx")}</span>}
          <button type="button" onClick={clear} aria-label={t("geo.clear")} className="ml-1 rounded-full p-0.5 text-gray-400 hover:bg-white hover:text-loco-navy"><X size={14} /></button>
        </span>
      ) : null}

      <button
        type="button"
        onClick={locate}
        disabled={busy}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${known && source === "gps" ? "border border-blue-100 bg-white text-loco-navy hover:bg-loco-ice" : "bg-loco-blue text-white hover:bg-loco-blue-dark"} disabled:opacity-60`}
      >
        {busy ? <LoaderCircle size={16} className="animate-spin" /> : <LocateFixed size={16} />}
        {busy ? t("geo.locating") : known && source === "gps" ? t("geo.update") : t("geo.useMyLocation")}
      </button>

      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </div>
  );
}
