import { ArrowRight, BadgeCheck, MapPin, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useT } from "../i18n";
import { getSavedDistrict, saveDistrict } from "../lib/rwanda";
import { Avatar } from "./PersonCard";
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

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 lg:pt-16">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_minmax(0,560px)]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-loco-mint">
              <MapPin size={15} />
              {t("hero.badge")}
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl xl:text-6xl">
              {t("hero.title1")}
              <br />
              <span className="text-loco-orange">{t("hero.title2")}</span>
            </h1>

            <p className="mt-4 max-w-xl text-lg text-white/80">{t("hero.text")}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register?role=SELLER" className="inline-flex items-center gap-2 rounded-full bg-loco-mint px-6 py-3 font-bold text-loco-wine-dark hover:bg-loco-mint-dark">
                {t("hero.openShop")} <ArrowRight size={18} />
              </Link>
              <Link to="/jobs/new" className="rounded-full border border-white/40 px-6 py-3 font-bold hover:bg-white/10">
                {t("hero.hireWorkers")}
              </Link>
            </div>
          </div>

          <form role="search" onSubmit={handleSearch} className="overflow-hidden rounded-2xl bg-white p-2 text-loco-ink shadow-2xl">
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

              <label className="flex items-center gap-2 rounded-xl bg-loco-cream px-3 sm:w-48">
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
        </div>

        <PeopleWall district={district} />
      </div>
    </section>
  );
}

const WALL_SIZE = 8;

function PeopleWall({ district }) {
  const t = useT();
  const local = useFetch(district ? `/people?district=${encodeURIComponent(district)}&perPage=${WALL_SIZE}` : `/people?perPage=${WALL_SIZE}`);
  const localCount = local.data?.people?.length ?? 0;
  const needMore = Boolean(district) && !local.loading && localCount < WALL_SIZE;
  const others = useFetch(`/people?perPage=${WALL_SIZE * 2}`, { enabled: needMore });

  const people = useMemo(() => {
    const seen = new Set();
    const merged = [];
    for (const person of [...(local.data?.people || []), ...(needMore ? others.data?.people || [] : [])]) {
      if (!seen.has(person.id)) {
        seen.add(person.id);
        merged.push(person);
      }
    }
    return merged.slice(0, WALL_SIZE);
  }, [local.data, others.data, needMore]);

  const loading = local.loading || (needMore && others.loading && people.length === 0);

  return (
    <div className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold text-loco-mint"><Users size={16} /> {t("people.eyebrow")}</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{t("people.wallTitle")}</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/70">{t("people.wallText")}</p>
        </div>
        <Link to={district ? `/people?district=${encodeURIComponent(district)}` : "/people"} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/30 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
          {t("people.seeAll")} <ArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: WALL_SIZE }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/30 p-6 text-center text-white/70">
          <p>{t("people.joinText")}</p>
          <Link to="/register" className="mt-4 inline-block rounded-full bg-loco-mint px-5 py-2.5 text-sm font-bold text-loco-wine-dark">{t("people.join")}</Link>
        </div>
      ) : (
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {people.map((person) => (
            <HeroPersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}

function HeroPersonCard({ person }) {
  const t = useT();
  const shop = person.shop;

  return (
    <Link
      to={`/people/${person.id}`}
      className="group flex w-56 shrink-0 snap-start flex-col items-center rounded-2xl border border-white/15 bg-white/10 p-5 text-center backdrop-blur transition hover:-translate-y-1 hover:border-loco-mint/60 hover:bg-white/15 sm:w-auto"
    >
      <Avatar person={person} size="h-20 w-20" textSize="text-3xl" />
      <strong className="mt-3 flex w-full items-center justify-center gap-1 text-white">
        <span className="truncate">{person.name}</span>
        {shop?.verified && <BadgeCheck size={15} className="shrink-0 text-loco-mint" />}
      </strong>
      <span className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-loco-mint">{person.headline}</span>
      <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-white/60">
        <MapPin size={11} /> {person.district || "Rwanda"}
      </span>
      {person.skills?.length > 0 && (
        <span className="mt-3 flex flex-wrap justify-center gap-1">
          {person.skills.slice(0, 2).map((skill) => (
            <span key={skill} className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white/90">{skill}</span>
          ))}
        </span>
      )}
      <span className="mt-auto pt-4 text-xs font-bold text-loco-orange group-hover:text-white">
        {shop ? t("people.shopOwner") : t("people.specialist")} →
      </span>
    </Link>
  );
}
