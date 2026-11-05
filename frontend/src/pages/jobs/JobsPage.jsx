import { Briefcase, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import JobCard from "../../components/JobCard";
import {
  Button,
  Container,
  DistrictSelect,
  EmptyState,
  PageHeader,
  Pagination,
  Select,
  Spinner,
} from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { buildQuery } from "../../api/api";
import { JOB_TYPES } from "../../lib/format";
import { getSavedDistrict, saveDistrict } from "../../lib/rwanda";

export default function JobsPage() {
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
        <PageHeader
          eyebrow="Local jobs"
          title="Work in your district"
          description="Daily and contract work on building sites, in factories, farms, shops and homes. Apply with your phone number and the employer calls you."
          action={<Button as={Link} to="/jobs/new" variant="orange"><Briefcase size={18} /> Post a job</Button>}
        />

        <form
          onSubmit={(event) => { event.preventDefault(); update({ search: text.trim() }); }}
          className="grid gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm md:grid-cols-[1fr_200px_180px_auto]"
        >
          <label className="flex items-center gap-2 rounded-xl bg-loco-cream px-3">
            <Search size={18} className="text-loco-wine" />
            <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Mason, driver, factory, house help..." aria-label="Search jobs" className="w-full bg-transparent py-3 outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-loco-cream px-3">
            <MapPin size={18} className="text-loco-orange" />
            <DistrictSelect aria-label="District" value={filters.district} onChange={(e) => update({ district: e.target.value })} placeholder="All districts" className="border-0! bg-transparent! px-0! py-3! focus:ring-0!" />
          </label>
          <Select aria-label="Job type" value={filters.jobType} onChange={(e) => update({ jobType: e.target.value })} className="bg-loco-cream! border-0!">
            <option value="">All job types</option>
            {Object.entries(JOB_TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </Select>
          <Button type="submit" variant="orange">Search</Button>
        </form>

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Type of work</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <button type="button" onClick={() => update({ category: "" })} className={`w-full rounded-lg px-3 py-2 text-left font-semibold ${!filters.category ? "bg-loco-cream text-loco-wine" : "hover:bg-loco-cream"}`}>All work</button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button type="button" onClick={() => update({ category: category.slug })} className={`w-full rounded-lg px-3 py-2 text-left font-semibold ${filters.category === category.slug ? "bg-loco-cream text-loco-wine" : "hover:bg-loco-cream"}`}>{category.name}</button>
                </li>
              ))}
            </ul>
          </aside>

          <section>
            <p className="mb-4 text-sm text-gray-600">
              {loading ? "Searching..." : `${data?.pagination?.total ?? 0} open jobs`}{filters.district ? ` in ${filters.district}` : " across Rwanda"}
            </p>

            {loading ? (
              <Spinner />
            ) : data?.jobs?.length ? (
              <>
                <div className="grid gap-4">
                  {data.jobs.map((job) => <JobCard key={job.id} job={job} />)}
                </div>
                <Pagination pagination={data.pagination} onPage={(page) => update({ page })} />
              </>
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No open jobs match"
                description={filters.district ? `Nothing in ${filters.district} right now. Try all districts, or post the job you are hiring for.` : "Try another search, or post a job."}
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    {filters.district && <Button variant="outline" onClick={() => update({ district: "" })}>All districts</Button>}
                    <Button as={Link} to="/jobs/new" variant="orange">Post a job</Button>
                  </div>
                }
              />
            )}
          </section>
        </div>
      </Container>
    </main>
  );
}
