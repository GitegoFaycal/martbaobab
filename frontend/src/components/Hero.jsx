import { ArrowRight, MapPin, Search, Users } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useT } from "../i18n";
import { getSavedDistrict, saveDistrict } from "../lib/rwanda";
import PersonCard from "./PersonCard";
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
    <section className="relative overflow-hidden bg-loco-wine text-white">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-loco-orange/25" />
      <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-loco-mint/15" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-loco-mint">
            <MapPin size={15} />
            {t("hero.badge")}
          </span>

          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            {t("hero.title1")}
            <br />
            <span className="text-loco-orange">{t("hero.title2")}</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-white/80">{t("hero.text")}</p>

          <form role="search" onSubmit={handleSearch} className="mt-8 overflow-hidden rounded-2xl bg-white p-2 text-loco-ink shadow-2xl">
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

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/register?role=SELLER" className="inline-flex items-center gap-2 rounded-full bg-loco-mint px-6 py-3 font-bold text-loco-wine-dark hover:bg-loco-mint-dark">
              {t("hero.openShop")} <ArrowRight size={18} />
            </Link>
            <Link to="/jobs/new" className="rounded-full border border-white/40 px-6 py-3 font-bold hover:bg-white/10">
              {t("hero.hireWorkers")}
            </Link>
          </div>
        </div>

        <PeopleWall district={district} />
      </div>
    </section>
  );
}

function PeopleWall({ district }) {
  const t = useT();
  const query = district ? `?district=${encodeURIComponent(district)}&perPage=6` : "?perPage=6";
  const { data, loading } = useFetch(`/people${query}`);
  const fallback = useFetch("/people?perPage=6", { enabled: Boolean(district) && !loading && (data?.people?.length ?? 0) < 3 });
  const people = (data?.people?.length ?? 0) >= 3 ? data.people : fallback.data?.people || data?.people || [];

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold text-loco-mint"><Users size={16} /> {t("people.eyebrow")}</p>
          <h2 className="mt-1 text-2xl font-black">{t("people.wallTitle")}</h2>
        </div>
        <Link to="/people" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-loco-mint hover:text-white sm:inline-flex">
          {t("people.seeAll")} <ArrowRight size={15} />
        </Link>
      </div>

      {loading && people.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/30 p-6 text-center text-white/70">
          <p>{t("people.joinText")}</p>
          <Link to="/register" className="mt-4 inline-block rounded-full bg-loco-mint px-5 py-2.5 text-sm font-bold text-loco-wine-dark">{t("people.join")}</Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {people.slice(0, 6).map((person) => (
            <PersonCard key={person.id} person={person} compact />
          ))}
        </div>
      )}

      <p className="mt-4 text-sm text-white/70">{t("people.wallText")}</p>
      <Link to="/people" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-loco-mint sm:hidden">
        {t("people.seeAll")} <ArrowRight size={15} />
      </Link>
    </div>
  );
}
