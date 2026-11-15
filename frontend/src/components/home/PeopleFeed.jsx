import { Briefcase, Search, SlidersHorizontal, Store, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buildQuery } from "../../api/api";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { getSavedDistrict, saveDistrict } from "../../lib/rwanda";
import { Button, DistrictSelect, EmptyState, Spinner } from "../ui";
import PersonCard from "../PersonCard";

const PAGE = 10;

export default function PeopleFeed() {
  const t = useT();
  const [district, setDistrict] = useState(getSavedDistrict);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(text.trim()), 350);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => setLimit(PAGE), [district, search, kind]);

  const query = useMemo(() => buildQuery({ district, search, kind, perPage: limit }), [district, search, kind, limit]);
  const { data, loading } = useFetch(`/people${query}`);
  const people = data?.people || [];
  const total = data?.pagination?.total ?? 0;

  const chips = [
    { key: "", label: t("landing.all"), icon: Users },
    { key: "sellers", label: t("landing.shops"), icon: Store },
    { key: "specialists", label: t("landing.specialists"), icon: Briefcase },
    { key: "hiring", label: t("landing.hiring"), icon: Briefcase },
  ];

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-xl font-black text-loco-navy sm:text-2xl">
          <Users size={22} className="text-loco-blue" />
          {district ? t("landing.communityIn", { district }) : t("landing.community")}
        </h2>
        <span className="text-sm text-gray-500">{!loading && t("people.count", { count: total })}</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 shadow-sm focus-within:border-loco-blue focus-within:ring-4 focus-within:ring-blue-100">
          <Search size={20} className="shrink-0 text-loco-navy" />
          <input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t("landing.searchPh")}
            aria-label={t("common.search")}
            className="w-full bg-transparent py-3.5 outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => setShowFilters((current) => !current)}
          aria-label={t("landing.filters")}
          aria-expanded={showFilters}
          className={`grid h-13 w-13 shrink-0 place-items-center rounded-2xl border p-3.5 ${showFilters || district ? "border-loco-blue bg-loco-navy text-white" : "border-blue-100 bg-white text-loco-navy"}`}
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {showFilters && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-blue-100 bg-white p-3">
          <MapPin size={18} className="shrink-0 text-loco-blue" />
          <DistrictSelect
            aria-label={t("common.district")}
            value={district}
            onChange={(event) => {
              setDistrict(event.target.value);
              saveDistrict(event.target.value);
            }}
            placeholder={t("common.allDistricts")}
            className="border-0! bg-transparent! px-0! py-2! focus:ring-0!"
          />
        </div>
      )}

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {chips.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setKind(key)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ${kind === key ? "bg-loco-navy text-white" : "border border-blue-100 bg-white text-loco-ink hover:bg-loco-ice"}`}
          >
            {key ? <Icon size={14} /> : null}
            {label}
          </button>
        ))}
        <Link to="/people" className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-loco-ink hover:bg-loco-ice">
          ··· {t("landing.more")}
        </Link>
      </div>

      <div className="mt-4">
        {loading && people.length === 0 ? (
          <Spinner label={t("common.loading")} />
        ) : people.length === 0 ? (
          <EmptyState icon={Users} title={t("people.none")} description={t("landing.noPeople")} action={district ? <Button variant="outline" onClick={() => { setDistrict(""); saveDistrict(""); }}>{t("common.allDistricts")}</Button> : null} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {people.map((person) => <PersonCard key={person.id} person={person} />)}
          </div>
        )}

        {people.length < total && (
          <div className="mt-5 text-center">
            <Button variant="outline" onClick={() => setLimit((current) => current + PAGE)} loading={loading}>{t("landing.showMore")}</Button>
          </div>
        )}
      </div>
    </section>
  );
}
