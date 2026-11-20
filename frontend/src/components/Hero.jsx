import { MapPin, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useT } from "../i18n";
import { getSavedDistrict, saveDistrict } from "../lib/rwanda";
import { DistrictSelect } from "./ui";

// One search bar for the market. Sections live in the header, so there are
// no tabs or extra buttons here.
export default function Hero() {
  const t = useT();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState(getSavedDistrict);

  function handleSearch(event) {
    event.preventDefault();
    saveDistrict(district);

    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (district) params.set("district", district);

    navigate(`/shop${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form role="search" onSubmit={handleSearch} className="flex flex-col gap-2 rounded-2xl border border-blue-100 bg-white p-2 shadow-lg shadow-blue-100/60 sm:flex-row">
      <label className="flex flex-1 items-center gap-3 rounded-xl bg-loco-ice px-3">
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

      <label className="flex items-center gap-2 rounded-xl bg-loco-ice px-3 sm:w-52">
        <MapPin size={18} className="shrink-0 text-loco-blue" />
        <DistrictSelect
          name="district"
          aria-label={t("common.district")}
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          placeholder={t("common.allDistricts")}
          className="border-0! bg-transparent! px-0! py-3! focus:ring-0!"
        />
      </label>

      <button type="submit" className="rounded-xl bg-loco-blue px-6 py-3 font-bold text-white hover:bg-loco-blue-dark">
        {t("common.search")}
      </button>
    </form>
  );
}
