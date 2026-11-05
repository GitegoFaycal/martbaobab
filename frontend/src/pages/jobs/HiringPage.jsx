import { Briefcase, MapPin, MessageCircle, Phone, Users } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../../api/api";
import {
  Badge,
  Button,
  Container,
  EmptyState,
  Message,
  PageHeader,
  Spinner,
} from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { APPLICATION_STATUS, JOB_TYPES, formatPay, timeAgo } from "../../lib/format";
import { formatPhoneForDisplay, whatsappLink } from "../../lib/rwanda";

export default function HiringPage() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useFetch("/jobs/mine");
  const jobs = data?.jobs || [];
  const selected = id ? jobs.find((job) => job.id === id) : null;

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <PageHeader
          eyebrow="Hiring"
          title="People I'm hiring"
          description="Your job posts and the workers who applied. Call or WhatsApp the ones you want, then mark them accepted."
          action={<Button as={Link} to="/jobs/new" variant="orange"><Briefcase size={18} /> Post a job</Button>}
        />

        {error && <Message className="mb-4">{error}</Message>}

        {loading ? (
          <Spinner />
        ) : jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="You have not posted a job yet" description="Need builders, factory hands, a driver or house help? Post the job and workers in your district will apply." action={<Button as={Link} to="/jobs/new" variant="orange">Post a job</Button>} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <ul className="space-y-3">
              {jobs.map((job) => (
                <li key={job.id}>
                  <Link to={`/hiring/${job.id}`} className={`block rounded-2xl border bg-white p-4 shadow-sm transition ${selected?.id === job.id ? "border-loco-orange ring-2 ring-orange-100" : "border-orange-100 hover:border-loco-orange"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <strong className="line-clamp-2 text-loco-ink">{job.title}</strong>
                      <Badge tone={job.status === "OPEN" ? "mint" : "red"}>{job.status === "OPEN" ? "Open" : job.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{job.district} · {JOB_TYPES[job.jobType]} · {formatPay(job)}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-loco-wine"><Users size={14} /> {job._count?.applications || 0} applicants</p>
                  </Link>
                </li>
              ))}
            </ul>

            <section>
              {selected ? (
                <Applicants job={selected} onChanged={refetch} />
              ) : (
                <EmptyState icon={Users} title="Choose a job" description="Select a job on the left to see who applied." />
              )}
            </section>
          </div>
        )}
      </Container>
    </main>
  );
}

function Applicants({ job, onChanged }) {
  const { data, loading, error, setData } = useFetch(`/jobs/${job.id}/applications`);
  const [busy, setBusy] = useState("");
  const [actionError, setActionError] = useState("");
  const applications = data?.applications || [];

  async function setStatus(application, status) {
    setBusy(application.id);
    setActionError("");
    try {
      const response = await apiRequest(`/jobs/${job.id}/applications/${application.id}`, { method: "PATCH", body: { status } });
      setData({ ...data, applications: applications.map((item) => (item.id === application.id ? { ...item, status: response.application.status } : item)) });
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setBusy("");
    }
  }

  async function toggleJob() {
    setBusy("job");
    try {
      await apiRequest(`/jobs/${job.id}/toggle`, { method: "PATCH" });
      onChanged();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-loco-wine">{job.title}</h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={14} className="text-loco-orange" /> {job.district}{job.sector ? `, ${job.sector}` : ""} · {job.workersNeeded} needed</p>
        </div>
        <div className="flex gap-2">
          <Button as={Link} to={`/jobs/${job.slug}`} variant="ghost" size="sm">View</Button>
          <Button as={Link} to={`/jobs/${job.id}/edit`} variant="outline" size="sm">Edit</Button>
          <Button variant={job.status === "OPEN" ? "danger" : "mint"} size="sm" loading={busy === "job"} onClick={toggleJob}>{job.status === "OPEN" ? "Close job" : "Reopen"}</Button>
        </div>
      </div>

      {error && <Message className="mt-4">{error}</Message>}
      {actionError && <Message className="mt-4">{actionError}</Message>}

      <h3 className="mt-6 font-black text-loco-ink">Applicants ({applications.length})</h3>

      {loading ? (
        <Spinner />
      ) : applications.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-loco-cream p-6 text-center text-sm text-gray-600">Nobody has applied yet. Share the job link on WhatsApp to reach more workers.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {applications.map((application) => {
            const status = APPLICATION_STATUS[application.status];
            const wa = whatsappLink(application.phone, `Hello ${application.applicant.name}, this is about the job "${job.title}" you applied for on LOCO.`);
            return (
              <li key={application.id} className="rounded-2xl border border-orange-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-loco-mint font-black text-loco-wine">{application.applicant.name.charAt(0).toUpperCase()}</span>
                    <div>
                      <strong className="text-loco-ink">{application.applicant.name}</strong>
                      <p className="text-xs text-gray-500">{application.applicant.district || "District not set"} · applied {timeAgo(application.createdAt)}</p>
                    </div>
                  </div>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>

                {application.message && <p className="mt-3 rounded-xl bg-loco-cream p-3 text-sm leading-6 text-gray-700">"{application.message}"</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button as="a" href={`tel:${application.phone}`} variant="outline" size="sm"><Phone size={14} /> {formatPhoneForDisplay(application.phone)}</Button>
                  {wa && <Button as="a" href={wa} target="_blank" rel="noreferrer" variant="mint" size="sm"><MessageCircle size={14} /> WhatsApp</Button>}
                  <span className="flex-1" />
                  {application.status !== "ACCEPTED" && <Button size="sm" loading={busy === application.id} onClick={() => setStatus(application, "ACCEPTED")}>Accept</Button>}
                  {application.status === "PENDING" && <Button size="sm" variant="ghost" loading={busy === application.id} onClick={() => setStatus(application, "SHORTLISTED")}>Shortlist</Button>}
                  {application.status !== "REJECTED" && <Button size="sm" variant="ghost" className="text-red-600" loading={busy === application.id} onClick={() => setStatus(application, "REJECTED")}>Not selected</Button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
