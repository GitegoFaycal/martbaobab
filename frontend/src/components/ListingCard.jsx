import { BadgeCheck, ImageOff, MapPin, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useT } from "../i18n";
import { discountPercent, formatRWF } from "../lib/format";

export default function ListingCard({ listing, onAddResult }) {
  const t = useT();
  const { addItem } = useCart();
  const image = listing.images?.[0]?.url;
  const discount = discountPercent(listing.originalPrice, listing.price);
  const district = listing.district || listing.shop?.district;
  const canBuy = listing.type === "PRODUCT" && (listing.stock ?? 1) > 0;

  function handleAdd(event) {
    event.preventDefault();
    const result = addItem(listing, 1);
    onAddResult?.(result, listing);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-loco-orange hover:shadow-md">
      <Link to={`/listings/${listing.slug}`} className="relative block">
        <div className="aspect-[4/3] w-full overflow-hidden bg-loco-cream">
          {image ? (
            <img src={image} alt={listing.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <div className="grid h-full w-full place-items-center text-loco-wine/40"><ImageOff size={36} /></div>
          )}
        </div>

        <div className="absolute left-3 top-3 flex gap-2">
          {listing.condition === "USED" && <span className="rounded-full bg-loco-wine px-2.5 py-1 text-xs font-bold text-white">{t("common.secondHand")}</span>}
          {listing.type === "SERVICE" && <span className="rounded-full bg-loco-mint px-2.5 py-1 text-xs font-bold text-loco-wine-dark">{t("common.service")}</span>}
          {discount > 0 && <span className="rounded-full bg-loco-orange px-2.5 py-1 text-xs font-bold text-white">-{discount}%</span>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/listings/${listing.slug}`} className="line-clamp-2 font-bold leading-snug text-loco-ink hover:text-loco-wine">{listing.name}</Link>

        <div className="mt-2 flex items-baseline gap-2">
          <strong className="text-lg text-loco-wine">{formatRWF(listing.price)}</strong>
          {listing.unit && <span className="text-xs text-gray-500">/ {listing.unit}</span>}
          {listing.originalPrice && discount > 0 && <span className="text-xs text-gray-400 line-through">{formatRWF(listing.originalPrice)}</span>}
        </div>

        {listing.negotiable && <span className="mt-1 text-xs font-semibold text-loco-orange">{t("common.negotiable")}</span>}

        <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={13} className="text-loco-orange" />
          <span className="truncate">{listing.shop?.name}{district ? ` · ${district}` : ""}</span>
          {listing.shop?.verified && <BadgeCheck size={14} className="shrink-0 text-loco-mint-dark" />}
        </div>

        <div className="mt-auto pt-4">
          {canBuy ? (
            <button type="button" onClick={handleAdd} className="flex w-full items-center justify-center gap-2 rounded-xl border border-loco-wine py-2 text-sm font-bold text-loco-wine hover:bg-loco-wine hover:text-white">
              <ShoppingCart size={16} />
              {t("listing.addToCart")}
            </button>
          ) : (
            <Link to={`/listings/${listing.slug}`} className="flex w-full items-center justify-center rounded-xl border border-loco-mint py-2 text-sm font-bold text-loco-wine hover:bg-loco-mint/10">
              {listing.type === "SERVICE" ? t("listing.contactProvider") : t("listing.soldOutView")}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
