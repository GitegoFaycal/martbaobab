import { ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button, Container, EmptyState, Message, PageHeader, Spinner } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { applicationStatus, formatPay, jobTypeLabel, timeAgo } from "../../lib/format";

export default function ApplicationsPage() {
  const t = useT();
  const { data, loading, error } = useFetch("/applications/mine");
  const applications = data?.applications || [];

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <PageHeader eyebrow={t("applications.eyebrow")} title={t("applications.title")} description={t("applications.text")} />
        {error && <Message className="mb-4">{error}</Message>}

        {loading ? (
          <Spinner label={t("common.loading")} />
        ) : applications.length === 0 ? (
          <EmptyState icon={ClipboardList} title={t("applications.none")} description={t("applications.noneText")} action={<Button as={Link} to="/jobs" variant="orange">{t("applications.findJobs")}</Button>} />
        ) : (
          <ul className="space-y-3">
            {applications.map((application) => {
              const status = applicationStatus(application.status, t);
              const job = application.job;
              return (
                <li key={application.id} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link to={`/jobs/${job.slug}`} className="font-black text-loco-ink hover:text-loco-wine">{job.title}</Link>
                      <p className="mt-1 text-sm text-gray-500">{job.employer?.name} · {job.district} · {jobTypeLabel(job.jobType, t)} · {formatPay(job, t)}</p>
                      <p className="mt-1 text-xs text-gray-400">{t("applications.appliedWhen", { when: timeAgo(application.createdAt, t) })}{job.status !== "OPEN" ? ` · ${t(`jobs.${job.status.toLowerCase()}`)}` : ""}</p>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  {application.status === "ACCEPTED" && (
                    <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">{t("applications.accepted", { phone: application.phone })}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </main>
  );
}
