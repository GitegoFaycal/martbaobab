import { BadgeCheck, Briefcase, Eye, Link2, MapPin, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "../i18n";
import { Badge } from "./ui";

export function Avatar({ person, size = "h-16 w-16", textSize = "text-2xl" }) {
  return person.avatarUrl ? (
    <img src={person.avatarUrl} alt="" loading="lazy" className={`${size} shrink-0 rounded-full object-cover ring-4 ring-white shadow`} />
  ) : (
    <span className={`grid ${size} shrink-0 place-items-center rounded-full bg-loco-mint ${textSize} font-black text-loco-wine ring-4 ring-white shadow`}>
      {person.name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function PersonCard({ person, compact = false }) {
  const t = useT();
  const shop = person.shop;

  if (compact) {
    return (
      <Link to={`/people/${person.id}`} className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">
        <Avatar person={person} size="h-14 w-14" textSize="text-xl" />
        <span className="min-w-0">
          <strong className="block truncate text-white">{person.name}</strong>
          <span className="block truncate text-sm text-loco-mint">{person.headline}</span>
          <span className="flex items-center gap-1 text-xs text-white/60"><MapPin size={11} /> {person.district || "Rwanda"}</span>
        </span>
      </Link>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-loco-orange hover:shadow-md">
      <Link to={`/people/${person.id}`} className="block aspect-4/3 w-full overflow-hidden bg-loco-cream">
        {person.avatarUrl ? (
          <img src={person.avatarUrl} alt={person.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-loco-mint/30 text-6xl font-black text-loco-wine">{person.name.charAt(0).toUpperCase()}</div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/people/${person.id}`} className="flex items-center gap-1 font-black text-loco-ink hover:text-loco-wine">
          <span className="truncate">{person.name}</span>
          {shop?.verified && <BadgeCheck size={16} className="shrink-0 text-loco-mint-dark" />}
        </Link>
        <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-loco-wine">{person.headline}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} className="text-loco-orange" /> {person.district || "Rwanda"}{shop?.sector ? `, ${shop.sector}` : ""}</p>

        {person.bio && <p className="mt-3 line-clamp-2 text-sm text-gray-600">{person.bio}</p>}

        {person.skills?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {person.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="rounded-full bg-loco-cream px-2.5 py-1 text-xs font-semibold text-loco-wine">{skill}</span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1"><Eye size={12} /> {t("connections.viewers", { count: person.views ?? 0 })}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-loco-mint-dark"><Link2 size={12} /> {t("connections.connections", { count: person.connections ?? 0 })}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-gray-500">
          <Badge tone={shop ? "blue" : "mint"}>
            {shop ? <><Store size={12} /> {t("people.shopOwner")}</> : <><Briefcase size={12} /> {t("people.specialist")}</>}
          </Badge>
          {shop ? (
            <span>{t("listing.listings", { count: shop._count?.listings ?? 0 })}</span>
          ) : person.openJobs > 0 ? (
            <span>{t("people.openJobs", { count: person.openJobs })}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
