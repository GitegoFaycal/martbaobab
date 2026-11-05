import { BadgeCheck, Eye, ImageOff, Link2, MapPin, Phone, Store } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ListingCard, { listingWhatsapp } from "../../components/ListingCard";
import WhatsAppIcon from "../../components/WhatsAppIcon";
import { Badge, Breadcrumbs, Button, Container, EmptyState, Spinner } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { discountPercent, formatRWF, timeAgo } from "../../lib/format";
import { recordConnection } from "../../lib/connect";
import { formatPhoneForDisplay } from "../../lib/rwanda";

export default function ListingDetailPage() {
  const t = useT();
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/listings/${slug}`);
  const [activeImage, setActiveImage] = useState(0);

  if (loading) {
    return <main className="min-h-[75vh] bg-loco-cream py-10"><Spinner label={t("common.loading")} /></main>;
  }

  if (error || !data?.listing) {
    return (
      <main className="min-h-[75vh] bg-loco-cream py-10">
        <Container><EmptyState title={t("listing.notFound")} description={t("listing.notFoundText")} action={<Button as={Link} to="/shop">{t("listing.backToShop")}</Button>} /></Container>
      </main>
    );
  }

  const { listing, related } = data;
  const images = listing.images || [];
  const image = images[activeImage]?.url;
  const discount = discountPercent(listing.originalPrice, listing.price);
  const soldOut = listing.type === "PRODUCT" && listing.stock != null && listing.stock <= 0;
  const isService = listing.type === "SERVICE";
  const district = listing.district || listing.shop?.district;
  const whatsapp = listingWhatsapp(listing, t);

  const sectionPath = listing.condition === "USED" ? "/second-hand" : isService ? "/services" : "/shop";
  const sectionLabel = listing.condition === "USED" ? t("nav.secondHand") : isService ? t("nav.services") : t("nav.shop");

  return (
    <main className="min-h-[75vh] bg-loco-cream py-8">
      <Container>
        <Breadcrumbs items={[{ label: t("common.home"), to: "/" }, { label: sectionLabel, to: sectionPath }, ...(listing.category ? [{ label: listing.category.name, to: `${sectionPath}?category=${listing.category.slug}` }] : []), { label: listing.name }]} />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white">
              <div className="aspect-4/3 w-full">
                {image ? <img src={image} alt={listing.name} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-loco-wine/30"><ImageOff size={64} /></div>}
              </div>
              <div className="absolute left-4 top-4 flex gap-2">
                {listing.condition === "USED" && <span className="rounded-full bg-loco-wine px-3 py-1 text-xs font-bold text-white">{t("common.secondHand")}</span>}
                {isService && <span className="rounded-full bg-loco-mint px-3 py-1 text-xs font-bold text-loco-wine-dark">{t("common.service")}</span>}
                {discount > 0 && <span className="rounded-full bg-loco-orange px-3 py-1 text-xs font-bold text-white">{t("common.save_pct", { pct: discount })}</span>}
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((item, index) => (
                  <button key={item.id} type="button" onClick={() => setActiveImage(index)} className={`h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 ${index === activeImage ? "border-loco-orange" : "border-transparent"}`}>
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-black text-loco-ink sm:text-3xl">{listing.name}</h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <strong className="text-3xl font-black text-loco-wine">{formatRWF(listing.price)}</strong>
              {listing.unit && <span className="text-sm text-gray-500">{t("listing.per", { unit: listing.unit })}</span>}
              {listing.originalPrice && discount > 0 && <span className="text-gray-400 line-through">{formatRWF(listing.originalPrice)}</span>}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {listing.negotiable && <Badge tone="amber">{t("common.negotiable")}</Badge>}
              {listing.condition === "USED" && listing.originalPrice && <Badge tone="mint">{t("listing.newPriceWas", { price: formatRWF(listing.originalPrice) })}</Badge>}
              {listing.stock != null && !isService && <Badge tone={listing.stock > 0 ? "green" : "red"}>{listing.stock > 0 ? t("listing.inStock", { count: listing.stock }) : t("listing.soldOut")}</Badge>}
            </div>

            {listing.description && <p className="mt-5 whitespace-pre-line leading-7 text-gray-700">{listing.description}</p>}

            <div className="mt-6 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 p-4">
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => recordConnection({ listingId: listing.id, channel: "WHATSAPP" })}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-lg font-bold text-white hover:bg-[#1ebe5d] ${soldOut ? "opacity-60" : ""}`}
                >
                  <WhatsAppIcon size={22} />
                  {t("listing.whatsappMe")}
                </a>
              ) : (
                <p className="text-center text-sm font-semibold text-gray-600">{t("listing.contactProvider")}</p>
              )}
              <p className="mt-3 text-center text-sm text-gray-600">{t("listing.dealText")}</p>
              {(listing.sellerConnections ?? 0) > 0 && (
                <p className="mt-2 inline-flex w-full items-center justify-center gap-1 text-center text-xs font-semibold text-loco-mint-dark">
                  <Link2 size={13} /> {t("connections.sellerConnected", { count: listing.sellerConnections })}
                </p>
              )}
            </div>

            {listing.shop?.phone && (
              <Button as="a" href={`tel:${listing.shop.phone}`} variant="outline" className="mt-3 w-full" onClick={() => recordConnection({ listingId: listing.id, channel: "CALL" })}>
                <Phone size={17} /> {formatPhoneForDisplay(listing.shop.phone)}
              </Button>
            )}

            <div className="mt-6 rounded-2xl bg-loco-cream p-4">
              <Link to={`/shops/${listing.shop.slug}`} className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-loco-wine text-white">
                  {listing.shop.logoUrl ? <img src={listing.shop.logoUrl} alt="" className="h-full w-full object-cover" /> : <Store size={22} />}
                </span>
                <span className="min-w-0">
                  <strong className="flex items-center gap-1 text-loco-wine">{listing.shop.name}{listing.shop.verified && <BadgeCheck size={16} className="text-loco-mint-dark" />}</strong>
                  <span className="flex items-center gap-1 text-sm text-gray-500"><MapPin size={13} className="text-loco-orange" />{district}{listing.shop.sector ? `, ${listing.shop.sector}` : ""}</span>
                </span>
              </Link>
            </div>

            <p className="mt-4 flex items-center gap-4 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1"><Eye size={13} /> {t("common.views", { count: listing.views })}</span>
              {(listing._count?.connections ?? 0) > 0 && <span className="inline-flex items-center gap-1"><Link2 size={13} /> {t("connections.listingConnected", { count: listing._count.connections })}</span>}
              <span>{t("common.listed", { when: timeAgo(listing.createdAt, t) })}</span>
            </p>
          </div>
        </div>

        {related?.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 text-2xl font-black text-loco-wine">{t("listing.youMayAlsoLike")}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{related.map((item) => <ListingCard key={item.id} listing={item} />)}</div>
          </section>
        )}
      </Container>
    </main>
  );
}
