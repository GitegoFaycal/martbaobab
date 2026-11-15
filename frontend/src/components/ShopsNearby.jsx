import { ArrowRight, Store } from "lucide-react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useT } from "../i18n";
import { buildQuery } from "../api/api";
import ShopTile from "./ShopTile";

// Shops matching the current district / search, scrolling sideways at the
// top of "Shop nearby" so shops are visible even before they list items.
// The list is rendered twice so the CSS marquee loops without a gap.
export default function ShopsNearby({ district = "", search = "" }) {
  const t = useT();
  const { data, loading } = useFetch(`/shops${buildQuery({ district, search, perPage: 16 })}`);
  const shops = data?.shops || [];

  if (loading || shops.length === 0) return null;

  const scrolls = shops.length > 3;
  const track = scrolls ? [...shops, ...shops] : shops;

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-black text-loco-navy"><Store size={18} className="text-loco-blue" /> {t("shops.nearby")}{district ? ` · ${district}` : ""}</h2>
        <Link to={`/shops${buildQuery({ district })}`} className="inline-flex items-center gap-1 text-sm font-bold text-loco-navy hover:gap-2">{t("home.allShops")} <ArrowRight size={14} /></Link>
      </div>

      <div className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0" style={{ maskImage: scrolls ? "linear-gradient(to right, transparent, black 4%, black 96%, transparent)" : undefined }}>
        <div className={`flex w-max gap-3 pb-2 ${scrolls ? "loco-marquee" : ""}`} style={{ "--marquee-duration": `${Math.max(24, shops.length * 5)}s` }}>
          {track.map((shop, index) => (
            <ShopTile key={`${shop.id}-${index}`} shop={shop} className="w-56 shrink-0" />
          ))}
        </div>
      </div>
    </section>
  );
}
