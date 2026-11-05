import { Briefcase, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import JobCard from "../../components/JobCard";
import { Button, Container, DistrictSelect, EmptyState, PageHeader, Pagination, Select, Spinner } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { buildQuery } from "../../api/api";
import { JOB_TYPES } from "../../lib/format";
import { getSavedDistrict, saveDistrict } from "../../lib/rwanda";

export default function JobsPage() {
  const t = useT();
  const [params, setParams] = useSearchParams();

  const filters = {
    search: params.get("search") || "",
    category: params.get("category") || "",
    district: params.get("district") ?? getSavedDistrict(),
    jobType: params.get("jobType") || "",
    page: Number(params.get("page")) || 1,
  };

  const [text, setText] = useState(filters.search);
  useEffect(() => setText(filters.search), [filters.search]);

  const { data, loading } = useFetch(`/jobs${buildQuery({ ...filters, perPage: 20 })}`);
  const { data: categoryData } = useFetch("/categories?kind=JOBS");
  const categories = categoryData?.categories || [];

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

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <PageHeader eyebrow={t("jobs.eyebrow")} title={t("jobs.title")} description={t("jobs.text")} action={<Button as={Link} to="/jobs/new" variant="orange"><Briefcase size={18} /> {t("jobs.postJob")}</Button>} />

        <form onSubmit={(event) => { event.preventDefault(); update({ search: text.trim() }); }} className="grid gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm md:grid-cols-[1fr_200px_180px_auto]">
          <label className="flex items-center gap-2 rounded-xl bg-loco-cream px-3">
            <Search size={18} className="text-loco-wine" />
            <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("jobs.searchPh")} aria-label={t("common.search")} className="w-full bg-transparent py-3 outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-loco-cream px-3">
            <MapPin size={18} className="text-loco-orange" />
            <DistrictSelect aria-label={t("common.district")} value={filters.district} onChange={(e) => update({ district: e.target.value })} placeholder={t("common.allDistricts")} className="border-0! bg-transparent! px-0! py-3! focus:ring-0!" />
          </label>
          <Select aria-label={t("jobs.type")} value={filters.jobType} onChange={(e) => update({ jobType: e.target.value })} className="bg-loco-cream! border-0!">
            <option value="">{t("jobs.allTypes")}</option>
            {Object.keys(JOB_TYPES).map((key) => <option key={key} value={key}>{t(`labels.jobTypes.${key}`)}</option>)}
          </Select>
          <Button type="submit" variant="orange">{t("common.search")}</Button>
        </form>

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">{t("jobs.typeOfWork")}</h2>
            <ul className="space-y-1 text-sm">
              <li><button type="button" onClick={() => update({ category: "" })} className={`w-full rounded-lg px-3 py-2 text-left font-semibold ${!filters.category ? "bg-loco-cream text-loco-wine" : "hover:bg-loco-cream"}`}>{t("jobs.allWork")}</button></li>
              {categories.map((category) => (
                <li key={category.id}><button type="button" onClick={() => update({ category: category.slug })} className={`w-full rounded-lg px-3 py-2 text-left font-semibold ${filters.category === category.slug ? "bg-loco-cream text-loco-wine" : "hover:bg-loco-cream"}`}>{category.name}</button></li>
              ))}
            </ul>
          </aside>

          <section>
            <p className="mb-4 text-sm text-gray-600">
              {loading ? t("common.searching") : t("jobs.openJobs", { count: data?.pagination?.total ?? 0 })} {filters.district ? t("common.in", { district: filters.district }) : t("common.acrossRwanda")}
            </p>

            {loading ? (
              <Spinner label={t("common.loading")} />
            ) : data?.jobs?.length ? (
              <>
                <div className="grid gap-4">{data.jobs.map((job) => <JobCard key={job.id} job={job} />)}</div>
                <Pagination pagination={data.pagination} onPage={(page) => update({ page })} />
              </>
            ) : (
              <EmptyState
                icon={Briefcase}
                title={t("jobs.none")}
                description={filters.district ? t("jobs.noneDistrict", { district: filters.district }) : t("jobs.noneText")}
                action={<div className="flex flex-wrap justify-center gap-2">{filters.district && <Button variant="outline" onClick={() => update({ district: "" })}>{t("common.allDistricts")}</Button>}<Button as={Link} to="/jobs/new" variant="orange">{t("jobs.postJob")}</Button></div>}
              />
            )}
          </section>
        </div>
      </Container>
    </main>
  );
}
