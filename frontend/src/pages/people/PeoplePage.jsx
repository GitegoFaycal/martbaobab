import { MapPin, Search, UserRound, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PersonCard from "../../components/PersonCard";
import { Button, Container, DistrictSelect, EmptyState, PageHeader, Pagination, Spinner } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { buildQuery } from "../../api/api";
import { getSavedDistrict, saveDistrict } from "../../lib/rwanda";

export default function PeoplePage() {
  const t = useT();
  const { isAuthenticated } = useAuth();
  const [params, setParams] = useSearchParams();

  const filters = {
    search: params.get("search") || "",
    district: params.get("district") ?? getSavedDistrict(),
    kind: params.get("kind") || "",
    page: Number(params.get("page")) || 1,
  };

  const [text, setText] = useState(filters.search);
  useEffect(() => setText(filters.search), [filters.search]);

  const { data, loading } = useFetch(`/people${buildQuery({ ...filters, perPage: 24 })}`);

  function update(changes) {
    const next = new URLSearchParams(params);
    Object.entries({ page: 1, ...changes }).forEach(([key, value]) => {
      if (!value || (key === "page" && value === 1)) next.delete(key); else next.set(key, value);
    });
    if ("district" in changes) {
      saveDistrict(changes.district);
      if (!changes.district) next.set("district", "");
    }
    setParams(next);
  }

  const kinds = [
    { key: "", label: t("people.all") },
    { key: "sellers", label: t("people.sellers") },
    { key: "specialists", label: t("people.specialists") },
  ];

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <PageHeader
          eyebrow={t("people.eyebrow")}
          title={t("people.title")}
          description={t("people.text")}
          action={<Button as={Link} to={isAuthenticated ? "/profile/edit" : "/register"} variant="orange"><UserRound size={18} /> {t("people.join")}</Button>}
        />

        <form onSubmit={(event) => { event.preventDefault(); update({ search: text.trim() }); }} className="grid gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm md:grid-cols-[1fr_220px_auto]">
          <label className="flex items-center gap-2 rounded-xl bg-loco-cream px-3">
            <Search size={18} className="text-loco-wine" />
            <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("people.searchPh")} aria-label={t("common.search")} className="w-full bg-transparent py-3 outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-loco-cream px-3">
            <MapPin size={18} className="text-loco-orange" />
            <DistrictSelect aria-label={t("common.district")} value={filters.district} onChange={(e) => update({ district: e.target.value })} placeholder={t("common.allDistricts")} className="border-0! bg-transparent! px-0! py-3! focus:ring-0!" />
          </label>
          <Button type="submit" variant="orange">{t("common.search")}</Button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {kinds.map((kind) => (
              <button key={kind.key} type="button" onClick={() => update({ kind: kind.key })} className={`rounded-full px-4 py-2 text-sm font-bold ${filters.kind === kind.key ? "bg-loco-wine text-white" : "bg-white text-loco-ink hover:bg-loco-cream"}`}>{kind.label}</button>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            {loading ? t("common.searching") : t("people.count", { count: data?.pagination?.total ?? 0 })} {filters.district ? t("common.in", { district: filters.district }) : t("common.acrossRwanda")}
          </p>
        </div>

        <div className="mt-5">
          {loading ? (
            <Spinner label={t("common.loading")} />
          ) : data?.people?.length ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.people.map((person) => <PersonCard key={person.id} person={person} />)}
              </div>
              <Pagination pagination={data.pagination} onPage={(page) => update({ page })} />
            </>
          ) : (
            <EmptyState icon={Users} title={t("people.none")} description={filters.district ? t("people.noneDistrict", { district: filters.district }) : t("people.noneText")} action={filters.district ? <Button variant="outline" onClick={() => update({ district: "" })}>{t("common.allDistricts")}</Button> : null} />
          )}
        </div>

        <section className="mt-12 rounded-3xl bg-loco-wine p-8 text-white">
          <h2 className="text-2xl font-black">{t("people.join")}</h2>
          <p className="mt-2 max-w-xl text-white/75">{t("people.joinText")}</p>
          <Button as={Link} to={isAuthenticated ? "/profile/edit" : "/register"} variant="mint" className="mt-5">{t("people.join")}</Button>
        </section>
      </Container>
    </main>
  );
}
