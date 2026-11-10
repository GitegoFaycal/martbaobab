import { BadgeCheck, ImageOff, Link2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "../i18n";
import { discountPercent, formatRWF } from "../lib/format";
import { recordConnection } from "../lib/connect";
import { whatsappLink } from "../lib/rwanda";
import WhatsAppIcon from "./WhatsAppIcon";

export function listingWhatsapp(listing, t) {
  const shop = listing.shop || {};
  const phone = shop.whatsapp || shop.phone;
  if (!phone) return null;

  const message = t("listing.prefill", {
    shop: shop.name || "",
    item: listing.name,
    price: formatRWF(listing.price),
  });

  return whatsappLink(phone, `${message}\n${window.location.origin}/listings/${listing.slug}`);
}

export default function ListingCard({ listing }) {
  const t = useT();
  const image = listing.images?.[0]?.url;
  const discount = discountPercent(listing.originalPrice, listing.price);
  const district = listing.district || listing.shop?.district;
  const whatsapp = listingWhatsapp(listing, t);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-loco-blue hover:shadow-md">
      <Link to={`/listings/${listing.slug}`} className="relative block">
        <div className="aspect-4/3 w-full overflow-hidden bg-loco-ice">
          {image ? (
            <img src={image} alt={listing.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <div className="grid h-full w-full place-items-center text-loco-navy/40"><ImageOff size={36} /></div>
          )}
        </div>

        <div className="absolute left-3 top-3 flex gap-2">
          {listing.condition === "USED" && <span className="rounded-full bg-loco-navy px-2.5 py-1 text-xs font-bold text-white">{t("common.secondHand")}</span>}
          {listing.type === "SERVICE" && <span className="rounded-full bg-loco-sky px-2.5 py-1 text-xs font-bold text-loco-navy-dark">{t("common.service")}</span>}
          {discount > 0 && <span className="rounded-full bg-loco-blue px-2.5 py-1 text-xs font-bold text-white">-{discount}%</span>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/listings/${listing.slug}`} className="line-clamp-2 font-bold leading-snug text-loco-ink hover:text-loco-navy">{listing.name}</Link>

        <div className="mt-2 flex items-baseline gap-2">
          <strong className="text-lg text-loco-navy">{formatRWF(listing.price)}</strong>
          {listing.unit && <span className="text-xs text-gray-500">/ {listing.unit}</span>}
          {listing.originalPrice && discount > 0 && <span className="text-xs text-gray-400 line-through">{formatRWF(listing.originalPrice)}</span>}
        </div>

        {listing.negotiable && <span className="mt-1 text-xs font-semibold text-loco-blue">{t("common.negotiable")}</span>}

        <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={13} className="text-loco-blue" />
          <span className="truncate">{listing.shop?.name}{district ? ` · ${district}` : ""}</span>
          {listing.shop?.verified && <BadgeCheck size={14} className="shrink-0 text-loco-sky-dark" />}
        </div>
        {(listing._count?.connections ?? 0) > 0 && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-loco-sky-dark">
            <Link2 size={12} /> {t("connections.connectionsShort", { count: listing._count.connections })}
          </p>
        )}

        <div className="mt-auto pt-4">
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              onClick={() => recordConnection({ listingId: listing.id, channel: "WHATSAPP" })}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-white hover:bg-[#1ebe5d]"
            >
              <WhatsAppIcon size={18} />
              {t("listing.whatsappMe")}
            </a>
          ) : (
            <Link to={`/listings/${listing.slug}`} className="flex w-full items-center justify-center rounded-xl border border-loco-sky py-2.5 text-sm font-bold text-loco-navy hover:bg-loco-sky/10">
              {t("listing.contactProvider")}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
