import { Banknote, CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "../i18n";
import { formatPay, jobTypeLabel, timeAgo } from "../lib/format";
import CategoryIcon from "./CategoryIcon";
import { Badge } from "./ui";

export default function JobCard({ job, compact = false }) {
  const t = useT();

  return (
    <article className="flex gap-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-loco-blue hover:shadow-md sm:p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-loco-ice text-loco-navy">
        <CategoryIcon name={job.category?.icon || "Briefcase"} size={24} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Link to={`/jobs/${job.slug}`} className="font-black leading-snug text-loco-ink hover:text-loco-navy">{job.title}</Link>
          <Badge tone={job.status === "OPEN" ? "mint" : "red"}>
            {job.status === "OPEN" ? jobTypeLabel(job.jobType, t) : t(`jobs.${job.status.toLowerCase()}`)}
          </Badge>
        </div>

        {!compact && job.description && <p className="mt-1.5 line-clamp-2 text-sm text-gray-600">{job.description}</p>}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1 font-bold text-loco-navy"><Banknote size={14} className="text-loco-blue" />{formatPay(job, t)}</span>
          <span className="inline-flex items-center gap-1"><MapPin size={14} className="text-loco-blue" />{job.district}{job.sector ? `, ${job.sector}` : ""}</span>
          <span className="inline-flex items-center gap-1"><Users size={14} className="text-loco-blue" />{job.workersNeeded} {job.workersNeeded === 1 ? t("jobs.worker") : t("jobs.workers")}</span>
          <span className="inline-flex items-center gap-1"><CalendarDays size={14} className="text-loco-blue" />{timeAgo(job.createdAt, t)}</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{job.employer?.name}{job.category ? ` · ${job.category.name}` : ""}</span>
          {job._count?.applications > 0 && <span className="font-semibold">{t("jobs.applied", { count: job._count.applications })}</span>}
        </div>
      </div>
    </article>
  );
}
