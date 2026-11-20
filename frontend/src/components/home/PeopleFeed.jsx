import { Briefcase, Search, SlidersHorizontal, Store, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buildQuery } from "../../api/api";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { EMPTY_LOCATION, getSavedLocation, locationLabel, saveLocation } from "../../lib/locations";
import LocationPicker from "../LocationPicker";
import { nearFor } from "../../lib/geo";
import { Button, EmptyState, Spinner, Container } from "../ui";
import PersonCard from "../PersonCard";

const PAGE = 10;

function Band({ embedded, children }) {
  return embedded ? <div className="bg-white"><Container className="pb-5 pt-5">{children}</Container></div> : children;
}

function ListWrap({ embedded, children }) {
  return embedded ? <Container className="py-8">{children}</Container> : <div className="mt-4">{children}</div>;
}

// `toolbar` (e.g. the Market/People switch) puts the feed in landing mode: the
// switch, search and chips share one white band and the heading is dropped.
export default function PeopleFeed({ toolbar = null, place: placeProp = null, onPlaceChange = null, locator = null }) {
  const t = useT();
  const [ownPlace, setOwnPlace] = useState(getSavedLocation);
  const place = placeProp || ownPlace;
  const setPlace = (next) => { if (onPlaceChange) onPlaceChange(next); else setOwnPlace(next); };
  const district = place.district;
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(text.trim()), 350);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => setLimit(PAGE), [place, search, kind]);

  const query = useMemo(() => buildQuery({ ...place, near: nearFor(place), search, kind, perPage: limit }), [place, search, kind, limit]);
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
      <Band embedded={Boolean(toolbar)}>
      {!toolbar && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-xl font-black text-loco-navy sm:text-2xl">
            <Users size={22} className="text-loco-blue" />
            {district ? t("landing.communityIn", { district: locationLabel(place) }) : t("landing.community")}
          </h2>
          <span className="text-sm text-gray-500">{!loading && t("people.count", { count: total })}</span>
        </div>
      )}

      <div className={`flex flex-col gap-3 ${toolbar ? "lg:flex-row lg:items-center" : ""}`}>
      {toolbar && <div className="shrink-0">{toolbar}</div>}
      <div className={`flex items-center gap-2 ${toolbar ? "min-w-0 flex-1" : "mt-4"}`}>
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
          <LocationPicker
            layout="inline"
            value={place}
            onChange={(next) => {
              setPlace(next);
              saveLocation(next);
            }}
            selectClassName="border-0! bg-transparent! px-1! py-2! text-sm focus:ring-0!"
          />
        </div>
      )}
      </div>

      <div className="-mx-4 mt-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
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
        {toolbar && <span className="ml-auto shrink-0 pl-2 text-sm text-gray-500">{!loading && t("people.count", { count: total })}</span>}
      </div>
      {locator && <div className="mt-3">{locator}</div>}
      </Band>

      <ListWrap embedded={Boolean(toolbar)}>
        {loading && people.length === 0 ? (
          <Spinner label={t("common.loading")} />
        ) : people.length === 0 ? (
          <EmptyState icon={Users} title={t("people.none")} description={t("landing.noPeople")} action={district ? <Button variant="outline" onClick={() => { setPlace(EMPTY_LOCATION); saveLocation(EMPTY_LOCATION); }}>{t("common.allDistricts")}</Button> : null} />
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
      </ListWrap>
    </section>
  );
}
