import { ArrowRight, BadgeCheck, MapPin, Store } from "lucide-react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useT } from "../i18n";
import { buildQuery } from "../api/api";

// Horizontal row of shops matching the current district / search, shown at
// the top of "Shop nearby" so shops are visible even before they list items.
export default function ShopsNearby({ district = "", search = "" }) {
  const t = useT();
  const { data, loading } = useFetch(`/shops${buildQuery({ district, search, perPage: 12 })}`);
  const shops = data?.shops || [];

  if (loading || shops.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-black text-loco-navy"><Store size={18} className="text-loco-blue" /> {t("shops.nearby")}{district ? ` · ${district}` : ""}</h2>
        <Link to={`/shops${buildQuery({ district })}`} className="inline-flex items-center gap-1 text-sm font-bold text-loco-navy hover:gap-2">{t("home.allShops")} <ArrowRight size={14} /></Link>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {shops.map((shop) => (
          <Link key={shop.id} to={`/shops/${shop.slug}`} className="flex w-60 shrink-0 gap-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-loco-blue">
            <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-loco-navy text-xl font-black text-white">
              {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : shop.name.charAt(0)}
            </span>
            <span className="min-w-0">
              <strong className="flex items-center gap-1 text-sm text-loco-navy"><span className="truncate">{shop.name}</span>{shop.verified && <BadgeCheck size={14} className="shrink-0 text-loco-sky-dark" />}</strong>
              <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500"><MapPin size={11} className="shrink-0 text-loco-blue" /> {shop.district}{shop.sector ? `, ${shop.sector}` : ""}</span>
              <span className="mt-1 block text-xs font-semibold text-gray-400">{t("listing.listings", { count: shop._count?.listings ?? 0 })}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
