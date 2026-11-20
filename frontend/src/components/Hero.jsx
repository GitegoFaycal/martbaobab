import { MapPin, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useT } from "../i18n";
import { getSavedLocation, saveLocation } from "../lib/locations";
import LocationPicker from "./LocationPicker";

// One search bar for the market. Sections live in the header, so there are
// no tabs or extra buttons here.
export default function Hero() {
  const t = useT();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState(getSavedLocation);

  function handleSearch(event) {
    event.preventDefault();
    saveLocation(place);

    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    for (const level of ["district", "sector", "cell", "village"]) if (place[level]) params.set(level, place[level]);

    navigate(`/shop${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form role="search" onSubmit={handleSearch} className="flex flex-col gap-2 rounded-2xl border border-blue-100 bg-white p-2 shadow-lg shadow-blue-100/60 sm:flex-row sm:items-center">
      <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-loco-ice px-3">
        <Search className="shrink-0 text-loco-navy" size={20} />
        <input
          type="search"
          name="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={t("hero.searchLabel")}
          placeholder={t("hero.phGoods")}
          className="w-full bg-transparent py-3 outline-none"
        />
      </label>

      <div className="flex items-center gap-2 rounded-xl bg-loco-ice px-3 py-1 sm:shrink-0">
        <MapPin size={18} className="shrink-0 text-loco-blue" />
        <LocationPicker layout="inline" value={place} onChange={setPlace} selectClassName="border-0! bg-transparent! px-1! py-2! text-sm focus:ring-0!" />
      </div>

      <button type="submit" className="rounded-xl bg-loco-blue px-6 py-3 font-bold text-white hover:bg-loco-blue-dark">
        {t("common.search")}
      </button>
    </form>
  );
}
