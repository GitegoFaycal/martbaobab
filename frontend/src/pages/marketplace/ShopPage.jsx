import { BadgeCheck, Eye, Link2, MapPin, Phone, Store } from "lucide-react";
import WhatsAppIcon from "../../components/WhatsAppIcon";
import { Link, useParams } from "react-router-dom";
import ListingCard from "../../components/ListingCard";
import { Breadcrumbs, Button, Container, EmptyState, Spinner } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useI18n } from "../../i18n";
import { formatDate } from "../../lib/format";
import { recordConnection } from "../../lib/connect";
import { formatPhoneForDisplay, whatsappLink } from "../../lib/rwanda";
import { placeLabel } from "../../lib/locations";

export default function ShopPage() {
  const { t, lang } = useI18n();
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/shops/${slug}`);

  if (loading) {
    return <main className="min-h-[75vh] bg-loco-ice py-10"><Spinner label={t("common.loading")} /></main>;
  }

  if (error || !data?.shop) {
    return (
      <main className="min-h-[75vh] bg-loco-ice py-10">
        <Container><EmptyState icon={Store} title={t("listing.shopNotFound")} action={<Button as={Link} to="/shops">{t("listing.allShops")}</Button>} /></Container>
      </main>
    );
  }

  const { shop, listings } = data;
  const whatsapp = whatsappLink(shop.whatsapp || shop.phone, `Hello ${shop.name}, I found your shop on LOCO.`);

  return (
    <main className="min-h-[75vh] bg-loco-ice pb-12">
      <Container>
        <section className="relative mt-6 flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl bg-gray-900 shadow-lg sm:min-h-[26rem]">
          {(shop.coverUrl || shop.logoUrl) && <img src={shop.coverUrl || shop.logoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />

          <div className="relative flex flex-col gap-5 p-6 text-white sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div className="flex min-w-0 items-end gap-4">
              {shop.logoUrl && shop.coverUrl && (
                <span className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/80 bg-white shadow sm:block">
                  <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" />
                </span>
              )}
              <div className="min-w-0">
                <h1 className="flex flex-wrap items-center gap-2 text-3xl font-black drop-shadow sm:text-4xl">
                  {shop.name}
                  {shop.verified && <span className="inline-flex items-center gap-1 rounded-full bg-green-500/90 px-2.5 py-1 text-xs font-bold"><BadgeCheck size={14} /> {t("common.verified")}</span>}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-white/85"><MapPin size={14} className="text-loco-sky" />{placeLabel(shop)}{shop.address ? ` · ${shop.address}` : ""}</p>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80">
                  <span className="inline-flex items-center gap-1 font-semibold text-loco-sky"><Link2 size={13} /> {t("connections.connections", { count: shop.owner?._count?.connectionsAsSeller ?? 0 })}</span>
                  <span className="inline-flex items-center gap-1"><Eye size={13} /> {t("connections.viewers", { count: shop.owner?.views ?? 0 })}</span>
                  <span>{t("listing.listings", { count: shop._count?.listings ?? listings.length })}</span>
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:w-52">
              {whatsapp && <Button as="a" href={whatsapp} target="_blank" rel="noreferrer" variant="whatsapp" onClick={() => recordConnection({ personId: shop.owner?.id, channel: "WHATSAPP" })}><WhatsAppIcon size={18} /> WhatsApp</Button>}
              {shop.phone && <a href={`tel:${shop.phone}`} onClick={() => recordConnection({ personId: shop.owner?.id, channel: "CALL" })} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/15 px-5 py-3 text-base font-bold text-white backdrop-blur hover:bg-white/30"><Phone size={17} /> {formatPhoneForDisplay(shop.phone)}</a>}
            </div>
          </div>
        </section>

        {shop.description && (
          <div className="mt-6 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
            <p className="max-w-3xl leading-7 text-gray-700">{shop.description}</p>
            <p className="mt-3 text-xs text-gray-500">{t("listing.onLocoSince", { date: formatDate(shop.createdAt, { month: "long", year: "numeric" }, lang) })}</p>
          </div>
        )}

        <div className="mt-8">
          <Breadcrumbs items={[{ label: t("common.home"), to: "/" }, { label: t("footer.shops"), to: "/shops" }, { label: shop.name }]} />
          <h2 className="mb-5 text-2xl font-black text-loco-navy">{t("listing.fromShop", { shop: shop.name })}</h2>
          {listings.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => <ListingCard key={listing.id} listing={{ ...listing, shop }} />)}
            </div>
          ) : (
            <EmptyState title={t("listing.noListings")} description={t("listing.noListingsText")} />
          )}
        </div>
      </Container>
    </main>
  );
}
