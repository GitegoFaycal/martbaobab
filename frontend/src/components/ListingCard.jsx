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

// Photo tile: the picture fills the card, the details and the WhatsApp
// button sit on a navy gradient in front of it.
export default function ListingCard({ listing }) {
  const t = useT();
  const image = listing.images?.[0]?.url;
  const discount = discountPercent(listing.originalPrice, listing.price);
  const district = listing.district || listing.shop?.district;
  const whatsapp = listingWhatsapp(listing, t);
  const connections = listing._count?.connections ?? 0;

  return (
    <article className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/listings/${listing.slug}`} className="absolute inset-0" aria-label={listing.name}>
        {image ? (
          <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <span className="grid h-full w-full place-items-center bg-loco-sky/30 text-loco-navy/40"><ImageOff size={48} /></span>
        )}
        <span className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />
      </Link>

      <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
        {listing.condition === "USED" && <span className="rounded-full bg-loco-navy/90 px-2 py-0.5 text-[11px] font-bold text-white">{t("common.secondHand")}</span>}
        {listing.type === "SERVICE" && <span className="rounded-full bg-loco-sky px-2 py-0.5 text-[11px] font-bold text-loco-navy-dark">{t("common.service")}</span>}
        {discount > 0 && <span className="rounded-full bg-loco-blue px-2 py-0.5 text-[11px] font-bold text-white">-{discount}%</span>}
      </div>

      <div className="pointer-events-none relative p-3 text-white">
        <Link to={`/listings/${listing.slug}`} className="pointer-events-auto line-clamp-2 text-[15px] font-black leading-snug drop-shadow">{listing.name}</Link>

        <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
          <strong className="whitespace-nowrap text-lg text-loco-sky">{formatRWF(listing.price)}</strong>
          {listing.unit && <span className="text-xs text-white/75">/ {listing.unit}</span>}
          {listing.originalPrice && discount > 0 && <span className="text-xs text-white/60 line-through">{formatRWF(listing.originalPrice)}</span>}
          {listing.negotiable && <span className="text-[11px] font-semibold text-white/80">· {t("common.negotiable")}</span>}
        </p>

        <p className="mt-1 flex items-center gap-1 text-xs text-white/85">
          <MapPin size={12} className="shrink-0 text-loco-sky" />
          <span className="truncate">{listing.shop?.name}{district ? ` · ${district}` : ""}</span>
          {listing.shop?.verified && <BadgeCheck size={13} className="shrink-0 text-loco-sky" />}
        </p>
        {connections > 0 && (
          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-loco-sky">
            <Link2 size={11} /> {t("connections.connectionsShort", { count: connections })}
          </p>
        )}

        <div className="pointer-events-auto mt-2.5">
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              onClick={() => recordConnection({ listingId: listing.id, channel: "WHATSAPP" })}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2 text-sm font-bold text-white hover:bg-[#1ebe5d]"
            >
              <WhatsAppIcon size={17} />
              {t("listing.whatsappMe")}
            </a>
          ) : (
            <Link to={`/listings/${listing.slug}`} className="flex w-full items-center justify-center rounded-xl border border-white/70 bg-white/15 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/30">
              {t("listing.contactProvider")}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
