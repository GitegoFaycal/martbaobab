import { BadgeCheck, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "../i18n";
import { placeLabel } from "../lib/locations";

// A shop as a photo card: cover (or logo) as the background, name and
// details laid over a navy gradient, like the people tiles.
export default function ShopTile({ shop, className = "" }) {
  const t = useT();
  const image = shop.coverUrl || shop.logoUrl;

  return (
    <Link to={`/shops/${shop.slug}`} className={`group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${className}`}>
      {image ? (
        <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      ) : (
        <span className="absolute inset-0 grid place-items-center bg-loco-sky/40 text-7xl font-black text-loco-navy">{shop.name.charAt(0)}</span>
      )}
      <span className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />

      <span className="relative p-3 text-white">
        <strong className="flex items-center gap-1 text-base leading-tight drop-shadow"><span className="truncate">{shop.name}</span>{shop.verified && <BadgeCheck size={15} className="shrink-0 text-loco-sky" />}</strong>
        <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-white/85"><MapPin size={11} className="shrink-0 text-loco-sky" /> {placeLabel(shop)}</span>
        <span className="mt-0.5 block text-[11px] font-semibold text-white/70">{t("listing.listings", { count: shop._count?.listings ?? 0 })}</span>
      </span>
    </Link>
  );
}
