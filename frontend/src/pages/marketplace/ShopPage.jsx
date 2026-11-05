import { BadgeCheck, MapPin, Phone, Store } from "lucide-react";
import WhatsAppIcon from "../../components/WhatsAppIcon";
import { Link, useParams } from "react-router-dom";
import ListingCard from "../../components/ListingCard";
import { Breadcrumbs, Button, Container, EmptyState, Spinner } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useI18n } from "../../i18n";
import { formatDate } from "../../lib/format";
import { formatPhoneForDisplay, whatsappLink } from "../../lib/rwanda";

export default function ShopPage() {
  const { t, lang } = useI18n();
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/shops/${slug}`);

  if (loading) {
    return <main className="min-h-[75vh] bg-loco-cream py-10"><Spinner label={t("common.loading")} /></main>;
  }

  if (error || !data?.shop) {
    return (
      <main className="min-h-[75vh] bg-loco-cream py-10">
        <Container><EmptyState icon={Store} title={t("listing.shopNotFound")} action={<Button as={Link} to="/shops">{t("listing.allShops")}</Button>} /></Container>
      </main>
    );
  }

  const { shop, listings } = data;
  const whatsapp = whatsappLink(shop.whatsapp || shop.phone, `Hello ${shop.name}, I found your shop on LOCO.`);

  return (
    <main className="min-h-[75vh] bg-loco-cream pb-12">
      <div className="h-44 bg-linear-to-r from-loco-wine to-loco-orange sm:h-56">
        {shop.coverUrl && <img src={shop.coverUrl} alt="" className="h-full w-full object-cover" />}
      </div>

      <Container>
        <div className="-mt-12 rounded-3xl border border-orange-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-loco-wine text-3xl font-black text-white shadow">
              {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : shop.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-black text-loco-wine sm:text-3xl">
                {shop.name}
                {shop.verified && <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700"><BadgeCheck size={14} /> {t("common.verified")}</span>}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={14} className="text-loco-orange" />{shop.district}{shop.sector ? `, ${shop.sector}` : ""}{shop.address ? ` · ${shop.address}` : ""}</p>
              {shop.description && <p className="mt-3 max-w-2xl leading-7 text-gray-700">{shop.description}</p>}
              <p className="mt-3 text-xs text-gray-400">{t("listing.listings", { count: shop._count?.listings ?? listings.length })} · {t("listing.onLocoSince", { date: formatDate(shop.createdAt, { month: "long", year: "numeric" }, lang) })}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:w-52">
              {shop.phone && <Button as="a" href={`tel:${shop.phone}`} variant="outline"><Phone size={17} /> {formatPhoneForDisplay(shop.phone)}</Button>}
              {whatsapp && <Button as="a" href={whatsapp} target="_blank" rel="noreferrer" variant="whatsapp"><WhatsAppIcon size={18} /> WhatsApp</Button>}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Breadcrumbs items={[{ label: t("common.home"), to: "/" }, { label: t("footer.shops"), to: "/shops" }, { label: shop.name }]} />
          <h2 className="mb-5 text-2xl font-black text-loco-wine">{t("listing.fromShop", { shop: shop.name })}</h2>
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
