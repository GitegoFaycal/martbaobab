import { BadgeCheck, Briefcase, Eye, Link2, MapPin, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "../i18n";
import ProfileActions from "./ProfileActions";

export function Avatar({ person, size = "h-16 w-16", textSize = "text-2xl" }) {
  return person.avatarUrl ? (
    <img src={person.avatarUrl} alt="" loading="lazy" className={`${size} shrink-0 rounded-full object-cover ring-4 ring-white shadow`} />
  ) : (
    <span className={`grid ${size} shrink-0 place-items-center rounded-full bg-loco-sky ${textSize} font-black text-loco-navy ring-4 ring-white shadow`}>
      {person.name.charAt(0).toUpperCase()}
    </span>
  );
}

// Full-bleed portrait with the name, details and the three actions laid over it.
export default function PersonCard({ person, compact = false }) {
  const t = useT();
  const shop = person.shop;
  const location = [person.district, person.sector || shop?.sector].filter(Boolean).join(", ") || "Rwanda";
  const verified = person.verified ?? Boolean(shop?.verified);

  if (compact) {
    return (
      <Link to={`/people/${person.id}`} className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">
        <Avatar person={person} size="h-14 w-14" textSize="text-xl" />
        <span className="min-w-0">
          <strong className="block truncate text-white">{person.name}</strong>
          <span className="block truncate text-sm text-loco-sky">{person.headline}</span>
          <span className="flex items-center gap-1 text-xs text-white/60"><MapPin size={11} /> {person.district || "Rwanda"}</span>
        </span>
      </Link>
    );
  }

  return (
    <article className="group relative flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl bg-loco-navy shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/people/${person.id}`} className="absolute inset-0" aria-label={person.name}>
        {person.avatarUrl ? (
          <img src={person.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
        ) : (
          <span className="grid h-full w-full place-items-center bg-loco-sky/40 text-8xl font-black text-loco-navy">{person.name.charAt(0).toUpperCase()}</span>
        )}
        <span className="absolute inset-0 bg-linear-to-t from-loco-navy via-loco-navy/55 to-transparent" />
      </Link>

      <div className="pointer-events-none relative p-4 text-white">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 backdrop-blur">
            {shop ? <><Store size={11} /> {t("people.shopOwner")}</> : <><Briefcase size={11} /> {t("people.specialist")}</>}
          </span>
          {verified && <span className="inline-flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5"><BadgeCheck size={11} /> {t("landing.verified")}</span>}
        </div>

        <Link to={`/people/${person.id}`} className="pointer-events-auto mt-2 block truncate text-xl font-black drop-shadow">{person.name}</Link>
        <p className="line-clamp-2 text-sm font-semibold text-loco-sky">{person.headline}</p>
        <p className="mt-1 flex items-center gap-1 truncate text-xs text-white/80"><MapPin size={12} /> {location}</p>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-white/80">
          <span className="inline-flex items-center gap-1 font-semibold text-loco-sky"><Link2 size={12} /> {t("connections.connections", { count: person.connections ?? 0 })}</span>
          <span className="inline-flex items-center gap-1"><Eye size={12} /> {t("connections.viewers", { count: person.views ?? 0 })}</span>
        </p>

        <div className="pointer-events-auto mt-3"><ProfileActions person={person} tone="dark" /></div>
      </div>
    </article>
  );
}
