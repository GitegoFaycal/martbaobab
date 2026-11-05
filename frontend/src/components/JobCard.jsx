import { Banknote, CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import CategoryIcon from "./CategoryIcon";
import { Badge } from "./ui";
import { JOB_TYPES, formatPay, timeAgo } from "../lib/format";

export default function JobCard({ job, compact = false }) {
  return (
    <article className="flex gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-loco-orange hover:shadow-md sm:p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-loco-cream text-loco-wine">
        <CategoryIcon name={job.category?.icon || "Briefcase"} size={24} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Link
            to={`/jobs/${job.slug}`}
            className="font-black leading-snug text-loco-ink hover:text-loco-wine"
          >
            {job.title}
          </Link>
          <Badge tone={job.status === "OPEN" ? "mint" : "red"}>
            {job.status === "OPEN" ? JOB_TYPES[job.jobType] : job.status}
          </Badge>
        </div>

        {!compact && job.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-gray-600">
            {job.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1 font-bold text-loco-wine">
            <Banknote size={14} className="text-loco-orange" />
            {formatPay(job)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} className="text-loco-orange" />
            {job.district}
            {job.sector ? `, ${job.sector}` : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={14} className="text-loco-orange" />
            {job.workersNeeded} {job.workersNeeded === 1 ? "worker" : "workers"}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={14} className="text-loco-orange" />
            {timeAgo(job.createdAt)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>
            {job.employer?.name}
            {job.category ? ` · ${job.category.name}` : ""}
          </span>
          {job._count?.applications > 0 && (
            <span className="font-semibold">
              {job._count.applications} applied
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
