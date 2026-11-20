import { Banknote, CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "../i18n";
import { categoryImage } from "../lib/categoryImages";
import { formatPay, jobTypeLabel, timeAgo } from "../lib/format";

// Job as a photo tile: the type-of-work photo sits behind a deep navy wash,
// the job details and employer in front.
export default function JobCard({ job, compact = false }) {
  const t = useT();
  const image = categoryImage(job.category?.slug);
  const open = job.status === "OPEN";

  return (
    <article className="group relative flex min-h-44 flex-col justify-end overflow-hidden rounded-2xl bg-loco-navy shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/jobs/${job.slug}`} className="absolute inset-0" aria-label={job.title}>
        <img src={image} alt="" loading="lazy" className="h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-105" />
        <span className="absolute inset-0 bg-linear-to-t from-loco-navy via-loco-navy/85 to-loco-navy/40" />
      </Link>

      <span className={`pointer-events-none absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${open ? "bg-loco-sky text-loco-navy-dark" : "bg-red-100 text-red-700"}`}>
        {open ? jobTypeLabel(job.jobType, t) : t(`jobs.${job.status.toLowerCase()}`)}
      </span>

      <div className="pointer-events-none relative p-4 text-white sm:p-5">
        <Link to={`/jobs/${job.slug}`} className="pointer-events-auto block pr-24 text-base font-black leading-snug drop-shadow">{job.title}</Link>
        {!compact && job.description && <p className="mt-1.5 line-clamp-2 text-sm text-white/80">{job.description}</p>}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/85">
          <span className="inline-flex items-center gap-1 font-bold text-loco-sky"><Banknote size={14} />{formatPay(job, t)}</span>
          <span className="inline-flex items-center gap-1"><MapPin size={14} className="text-loco-sky" />{job.district}{job.sector ? `, ${job.sector}` : ""}</span>
          <span className="inline-flex items-center gap-1"><Users size={14} className="text-loco-sky" />{job.workersNeeded} {job.workersNeeded === 1 ? t("jobs.worker") : t("jobs.workers")}</span>
          <span className="inline-flex items-center gap-1"><CalendarDays size={14} className="text-loco-sky" />{timeAgo(job.createdAt, t)}</span>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs text-white/70">
          <span className="truncate">{job.employer?.name}{job.category ? ` · ${job.category.name}` : ""}</span>
          {job._count?.applications > 0 && <span className="shrink-0 font-semibold">{t("jobs.applied", { count: job._count.applications })}</span>}
        </div>
      </div>
    </article>
  );
}
