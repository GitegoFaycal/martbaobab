import {
  Banknote,
  CalendarDays,
  Clock,
  Eye,
  MapPin,
  MessageCircle,
  Phone,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiRequest, fieldErrorsFrom } from "../../api/api";
import JobCard from "../../components/JobCard";
import {
  Badge,
  Breadcrumbs,
  Button,
  Container,
  EmptyState,
  Field,
  Input,
  Message,
  Spinner,
  Textarea,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { APPLICATION_STATUS, JOB_TYPES, formatDate, formatPay, timeAgo } from "../../lib/format";
import { formatPhoneForDisplay, whatsappLink } from "../../lib/rwanda";

export default function JobDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { data, loading, error, setData } = useFetch(`/jobs/${slug}`);

  const [form, setForm] = useState({ phone: formatPhoneForDisplay(user?.phone) || "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <main className="min-h-[75vh] bg-loco-cream py-10"><Spinner label="Loading job..." /></main>;
  }

  if (error || !data?.job) {
    return (
      <main className="min-h-[75vh] bg-loco-cream py-10">
        <Container><EmptyState title="Job not found" description="It may have been filled or closed." action={<Button as={Link} to="/jobs">All jobs</Button>} /></Container>
      </main>
    );
  }

  const { job, similar } = data;
  const myApplication = data.myApplication;
  const isEmployer = job.employer.id === user?.id;
  const whatsapp = whatsappLink(job.contactPhone, `Hello, I saw your job "${job.title}" on LOCO.`);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function handleApply(event) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await apiRequest(`/jobs/${job.id}/apply`, { method: "POST", body: form });
      setSuccess(response.message);
      setData({ ...data, myApplication: response.application, job: { ...job, _count: { applications: (job._count?.applications || 0) + 1 } } });
    } catch (requestError) {
      setErrors(fieldErrorsFrom(requestError));
      setSubmitError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-loco-cream py-8">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Jobs", to: "/jobs" }, ...(job.category ? [{ label: job.category.name, to: `/jobs?category=${job.category.slug}` }] : []), { label: job.title }]} />

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <article className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-loco-ink sm:text-3xl">{job.title}</h1>
                <p className="mt-1 text-sm text-gray-500">Posted by {job.employer.name} · {timeAgo(job.createdAt)}</p>
              </div>
              <Badge tone={job.status === "OPEN" ? "mint" : "red"} className="text-sm">{job.status === "OPEN" ? "Open" : job.status === "FILLED" ? "Filled" : "Closed"}</Badge>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Detail icon={Banknote} label="Pay" value={formatPay(job)} />
              <Detail icon={MapPin} label="Location" value={`${job.district}${job.sector ? `, ${job.sector}` : ""}`} />
              <Detail icon={Clock} label="Type of work" value={JOB_TYPES[job.jobType]} />
              <Detail icon={Users} label="Workers needed" value={`${job.workersNeeded}`} />
              {job.startDate && <Detail icon={CalendarDays} label="Start date" value={formatDate(job.startDate)} />}
              {job.durationText && <Detail icon={CalendarDays} label="Duration" value={job.durationText} />}
            </dl>

            <section className="mt-8">
              <h2 className="font-black text-loco-wine">About the work</h2>
              <p className="mt-2 whitespace-pre-line leading-7 text-gray-700">{job.description}</p>
            </section>

            {job.requirements && (
              <section className="mt-6">
                <h2 className="font-black text-loco-wine">What the employer is looking for</h2>
                <p className="mt-2 whitespace-pre-line leading-7 text-gray-700">{job.requirements}</p>
              </section>
            )}

            <p className="mt-6 flex items-center gap-4 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1"><Eye size={13} /> {job.views} views</span>
              <span>{job._count?.applications || 0} applied</span>
            </p>
          </article>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              {isEmployer ? (
                <>
                  <h2 className="font-black text-loco-wine">This is your job post</h2>
                  <p className="mt-2 text-sm text-gray-600">{job._count?.applications || 0} people have applied so far.</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Button as={Link} to={`/hiring/${job.id}`}>See applicants</Button>
                    <Button as={Link} to={`/jobs/${job.id}/edit`} variant="outline">Edit job</Button>
                  </div>
                </>
              ) : job.status !== "OPEN" ? (
                <>
                  <h2 className="font-black text-loco-wine">This job is {job.status.toLowerCase()}</h2>
                  <p className="mt-2 text-sm text-gray-600">The employer is no longer taking applications.</p>
                  <Button as={Link} to="/jobs" variant="outline" className="mt-4 w-full">Find other jobs</Button>
                </>
              ) : myApplication ? (
                <>
                  <h2 className="font-black text-loco-wine">You applied</h2>
                  {success && <Message type="success" className="mt-3">{success}</Message>}
                  <p className="mt-3 text-sm text-gray-600">Sent {timeAgo(myApplication.createdAt)}. The employer will call you if you are selected.</p>
                  <Badge tone={APPLICATION_STATUS[myApplication.status].tone} className="mt-3">{APPLICATION_STATUS[myApplication.status].label}</Badge>
                  <Button as={Link} to="/applications" variant="outline" className="mt-5 w-full">My applications</Button>
                </>
              ) : !isAuthenticated ? (
                <>
                  <h2 className="font-black text-loco-wine">Apply for this job</h2>
                  <p className="mt-2 text-sm text-gray-600">Create a free LOCO account so the employer can reach you.</p>
                  <Button as={Link} to="/login" state={{ from: location, message: "Log in to apply for this job." }} variant="orange" className="mt-4 w-full">Log in to apply</Button>
                  <Button as={Link} to="/register" variant="outline" className="mt-2 w-full">Create account</Button>
                </>
              ) : (
                <form onSubmit={handleApply}>
                  <h2 className="font-black text-loco-wine">Apply for this job</h2>
                  <p className="mt-1 text-sm text-gray-600">The employer sees your name, district and this message, then calls you.</p>
                  {submitError && <Message className="mt-4">{submitError}</Message>}
                  <div className="mt-4 space-y-4">
                    <Field label="Your telephone number" htmlFor="phone" error={errors.phone}>
                      <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="078 123 4567" error={errors.phone} required />
                    </Field>
                    <Field label="Short message" htmlFor="message" optional error={errors.message} hint="Your experience, when you can start, tools you have.">
                      <Textarea id="message" name="message" rows={4} value={form.message} onChange={handleChange} placeholder="I have 3 years experience as a mason and can start tomorrow." />
                    </Field>
                  </div>
                  <Button type="submit" variant="orange" className="mt-5 w-full" loading={submitting}>{submitting ? "Sending..." : "Send application"}</Button>
                </form>
              )}
            </section>

            {job.contactPhone && job.status === "OPEN" && !isEmployer && (
              <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-black text-loco-wine">Or contact the employer directly</h2>
                <div className="mt-3 flex flex-col gap-2">
                  <Button as="a" href={`tel:${job.contactPhone}`} variant="outline" size="sm"><Phone size={15} /> {formatPhoneForDisplay(job.contactPhone)}</Button>
                  {whatsapp && <Button as="a" href={whatsapp} target="_blank" rel="noreferrer" variant="mint" size="sm"><MessageCircle size={15} /> WhatsApp</Button>}
                </div>
              </section>
            )}
          </aside>
        </div>

        {similar?.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 text-2xl font-black text-loco-wine">Similar jobs</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {similar.map((item) => <JobCard key={item.id} job={item} compact />)}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-loco-cream p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-loco-wine shadow-sm"><Icon size={19} /></span>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</dt>
        <dd className="mt-0.5 font-bold text-loco-ink">{value}</dd>
      </div>
    </div>
  );
}
