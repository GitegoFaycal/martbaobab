import { ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
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

export default function ApplicationsPage() {
  const { data, loading, error } = useFetch("/applications/mine");
  const applications = data?.applications || [];

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <PageHeader eyebrow="Your work" title="My job applications" description="Jobs you applied for. Employers call the number you gave when they choose you." />

        {error && <Message className="mb-4">{error}</Message>}

        {loading ? (
          <Spinner />
        ) : applications.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No applications yet" description="Find daily or contract work in your district and apply with one tap." action={<Button as={Link} to="/jobs" variant="orange">Find jobs</Button>} />
        ) : (
          <ul className="space-y-3">
            {applications.map((application) => {
              const status = APPLICATION_STATUS[application.status];
              const job = application.job;
              return (
                <li key={application.id} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link to={`/jobs/${job.slug}`} className="font-black text-loco-ink hover:text-loco-wine">{job.title}</Link>
                      <p className="mt-1 text-sm text-gray-500">{job.employer?.name} · {job.district} · {JOB_TYPES[job.jobType]} · {formatPay(job)}</p>
                      <p className="mt-1 text-xs text-gray-400">Applied {timeAgo(application.createdAt)}{job.status !== "OPEN" ? ` · job ${job.status.toLowerCase()}` : ""}</p>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  {application.status === "ACCEPTED" && (
                    <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">You were accepted. The employer should call you on {application.phone}. If not, contact them from the job page.</p>
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
