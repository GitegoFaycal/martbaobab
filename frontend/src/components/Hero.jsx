import { ArrowRight, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useT } from "../i18n";
import { getSavedDistrict, saveDistrict } from "../lib/rwanda";
import { DistrictSelect } from "./ui";

export default function Hero() {
  const t = useT();
  const navigate = useNavigate();

  const tabs = [
    { key: "shop", label: t("hero.tabGoods"), path: "/shop", placeholder: t("hero.phGoods") },
    { key: "second-hand", label: t("hero.tabSecondHand"), path: "/second-hand", placeholder: t("hero.phSecondHand") },
    { key: "jobs", label: t("hero.tabJobs"), path: "/jobs", placeholder: t("hero.phJobs") },
    { key: "people", label: t("nav.people"), path: "/people", placeholder: t("people.searchPh") },
  ];

  const [tabKey, setTabKey] = useState("shop");
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState(getSavedDistrict);
  const tab = tabs.find((item) => item.key === tabKey) || tabs[0];

  function handleSearch(event) {
    event.preventDefault();
    saveDistrict(district);

    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (district) params.set("district", district);

    navigate(`${tab.path}${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <section className="relative overflow-hidden bg-white text-loco-ink">
      {/* Market search */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-loco-orange/10" />
      <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-loco-mint/10" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <form role="search" onSubmit={handleSearch} className="flex-1 overflow-hidden rounded-2xl border border-orange-100 bg-white p-2 shadow-xl shadow-orange-100/60">
            <div className="mb-2 flex flex-wrap gap-1 px-1">
              {tabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTabKey(item.key)}
                  aria-pressed={tab.key === item.key}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${tab.key === item.key ? "bg-loco-wine text-white" : "text-gray-500 hover:bg-loco-cream"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex flex-1 items-center gap-3 rounded-xl bg-loco-cream px-3">
                <Search className="shrink-0 text-loco-wine" size={20} />
                <input
                  type="search"
                  name="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label={t("hero.searchLabel")}
                  placeholder={tab.placeholder}
                  className="w-full bg-transparent py-3 outline-none"
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl bg-loco-cream px-3 sm:w-52">
                <MapPin size={18} className="shrink-0 text-loco-orange" />
                <DistrictSelect
                  name="district"
                  aria-label={t("common.district")}
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  placeholder={t("common.allDistricts")}
                  className="border-0! bg-transparent! px-0! py-3! focus:ring-0!"
                />
              </label>

              <button type="submit" className="rounded-xl bg-loco-orange px-6 py-3 font-bold text-white hover:bg-loco-orange-dark">
                {t("common.search")}
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-3 lg:flex-col">
            <Link to="/register?role=SELLER" className="inline-flex items-center justify-center gap-2 rounded-full bg-loco-wine px-6 py-3 font-bold text-white hover:bg-loco-wine-dark">
              {t("hero.openShop")} <ArrowRight size={18} />
            </Link>
            <Link to="/jobs/new" className="inline-flex items-center justify-center rounded-full border border-loco-wine px-6 py-3 font-bold text-loco-wine hover:bg-loco-cream">
              {t("hero.hireWorkers")}
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
