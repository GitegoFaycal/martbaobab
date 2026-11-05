import {
  Banknote,
  CalendarDays,
  Clock,
  Eye,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiRequest, fieldErrorsFrom } from "../../api/api";
import JobCard from "../../components/JobCard";
import WhatsAppIcon from "../../components/WhatsAppIcon";
import { Badge, Breadcrumbs, Button, Container, EmptyState, Field, Input, Message, Spinner, Textarea } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { useI18n } from "../../i18n";
import { applicationStatus, formatDate, formatPay, jobTypeLabel, timeAgo } from "../../lib/format";
import { formatPhoneForDisplay, whatsappLink } from "../../lib/rwanda";

export default function JobDetailPage() {
  const { t, lang } = useI18n();
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
    return <main className="min-h-[75vh] bg-loco-cream py-10"><Spinner label={t("common.loading")} /></main>;
  }

  if (error || !data?.job) {
    return (
      <main className="min-h-[75vh] bg-loco-cream py-10">
        <Container><EmptyState title={t("jobs.notFound")} description={t("jobs.notFoundText")} action={<Button as={Link} to="/jobs">{t("jobs.allJobs")}</Button>} /></Container>
      </main>
    );
  }

  const { job, similar } = data;
  const myApplication = data.myApplication;
  const isEmployer = job.employer.id === user?.id;
  const whatsapp = whatsappLink(job.contactPhone, `Hello, I saw your job "${job.title}" on LOCO.`);
  const statusLabel = t(`jobs.${job.status.toLowerCase()}`);

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
        <Breadcrumbs items={[{ label: t("common.home"), to: "/" }, { label: t("nav.jobs"), to: "/jobs" }, ...(job.category ? [{ label: job.category.name, to: `/jobs?category=${job.category.slug}` }] : []), { label: job.title }]} />

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <article className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-loco-ink sm:text-3xl">{job.title}</h1>
                <p className="mt-1 text-sm text-gray-500">{t("jobs.postedBy", { name: job.employer.name, when: timeAgo(job.createdAt, t) })}</p>
              </div>
              <Badge tone={job.status === "OPEN" ? "mint" : "red"} className="text-sm">{statusLabel}</Badge>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Detail icon={Banknote} label={t("jobs.pay")} value={formatPay(job, t)} />
              <Detail icon={MapPin} label={t("jobs.location")} value={`${job.district}${job.sector ? `, ${job.sector}` : ""}`} />
              <Detail icon={Clock} label={t("jobs.type")} value={jobTypeLabel(job.jobType, t)} />
              <Detail icon={Users} label={t("jobs.workersNeeded")} value={`${job.workersNeeded}`} />
              {job.startDate && <Detail icon={CalendarDays} label={t("jobs.startDate")} value={formatDate(job.startDate, undefined, lang)} />}
              {job.durationText && <Detail icon={CalendarDays} label={t("jobs.duration")} value={job.durationText} />}
            </dl>

            <section className="mt-8">
              <h2 className="font-black text-loco-wine">{t("jobs.aboutWork")}</h2>
              <p className="mt-2 whitespace-pre-line leading-7 text-gray-700">{job.description}</p>
            </section>

            {job.requirements && (
              <section className="mt-6">
                <h2 className="font-black text-loco-wine">{t("jobs.lookingFor")}</h2>
                <p className="mt-2 whitespace-pre-line leading-7 text-gray-700">{job.requirements}</p>
              </section>
            )}

            <p className="mt-6 flex items-center gap-4 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1"><Eye size={13} /> {t("jobs.views", { count: job.views })}</span>
              <span>{t("jobs.applied", { count: job._count?.applications || 0 })}</span>
            </p>
          </article>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              {isEmployer ? (
                <>
                  <h2 className="font-black text-loco-wine">{t("jobs.yourPost")}</h2>
                  <p className="mt-2 text-sm text-gray-600">{t("jobs.appliedSoFar", { count: job._count?.applications || 0 })}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Button as={Link} to={`/hiring/${job.id}`}>{t("jobs.seeApplicants")}</Button>
                    <Button as={Link} to={`/jobs/${job.id}/edit`} variant="outline">{t("jobs.editJob")}</Button>
                  </div>
                </>
              ) : job.status !== "OPEN" ? (
                <>
                  <h2 className="font-black text-loco-wine">{t("jobs.jobIs", { status: statusLabel.toLowerCase() })}</h2>
                  <p className="mt-2 text-sm text-gray-600">{t("jobs.jobClosedText")}</p>
                  <Button as={Link} to="/jobs" variant="outline" className="mt-4 w-full">{t("jobs.findOther")}</Button>
                </>
              ) : myApplication ? (
                <>
                  <h2 className="font-black text-loco-wine">{t("jobs.youApplied")}</h2>
                  {success && <Message type="success" className="mt-3">{success}</Message>}
                  <p className="mt-3 text-sm text-gray-600">{t("jobs.sentAgo", { when: timeAgo(myApplication.createdAt, t) })}</p>
                  <Badge tone={applicationStatus(myApplication.status, t).tone} className="mt-3">{applicationStatus(myApplication.status, t).label}</Badge>
                  <Button as={Link} to="/applications" variant="outline" className="mt-5 w-full">{t("jobs.myApplications")}</Button>
                </>
              ) : !isAuthenticated ? (
                <>
                  <h2 className="font-black text-loco-wine">{t("jobs.apply")}</h2>
                  <p className="mt-2 text-sm text-gray-600">{t("jobs.loginToApplyText")}</p>
                  <Button as={Link} to="/login" state={{ from: location, message: t("jobs.loginMessage") }} variant="orange" className="mt-4 w-full">{t("jobs.loginToApply")}</Button>
                  <Button as={Link} to="/register" variant="outline" className="mt-2 w-full">{t("jobs.createAccount")}</Button>
                </>
              ) : (
                <form onSubmit={handleApply}>
                  <h2 className="font-black text-loco-wine">{t("jobs.apply")}</h2>
                  <p className="mt-1 text-sm text-gray-600">{t("jobs.applyText")}</p>
                  {submitError && <Message className="mt-4">{submitError}</Message>}
                  <div className="mt-4 space-y-4">
                    <Field label={t("jobs.yourPhone")} htmlFor="phone" error={errors.phone}>
                      <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="078 123 4567" error={errors.phone} required />
                    </Field>
                    <Field label={t("jobs.shortMessage")} htmlFor="message" optional error={errors.message} hint={t("jobs.messageHint")}>
                      <Textarea id="message" name="message" rows={4} value={form.message} onChange={handleChange} placeholder={t("jobs.messagePh")} />
                    </Field>
                  </div>
                  <Button type="submit" variant="orange" className="mt-5 w-full" loading={submitting}>{submitting ? t("jobs.sending") : t("jobs.send")}</Button>
                </form>
              )}
            </section>

            {job.contactPhone && job.status === "OPEN" && !isEmployer && (
              <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-black text-loco-wine">{t("jobs.contactDirectly")}</h2>
                <div className="mt-3 flex flex-col gap-2">
                  <Button as="a" href={`tel:${job.contactPhone}`} variant="outline" size="sm"><Phone size={15} /> {formatPhoneForDisplay(job.contactPhone)}</Button>
                  {whatsapp && <Button as="a" href={whatsapp} target="_blank" rel="noreferrer" variant="whatsapp" size="sm"><WhatsAppIcon size={16} /> WhatsApp</Button>}
                </div>
              </section>
            )}
          </aside>
        </div>

        {similar?.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 text-2xl font-black text-loco-wine">{t("jobs.similar")}</h2>
            <div className="grid gap-4 md:grid-cols-2">{similar.map((item) => <JobCard key={item.id} job={item} compact />)}</div>
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
