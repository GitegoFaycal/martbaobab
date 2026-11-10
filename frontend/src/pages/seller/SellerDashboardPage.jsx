import {
  BadgeCheck,
  Eye,
  ImageOff,
  Link2,
  Package,
  Pencil,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/api";
import {
  Badge,
  Button,
  Container,
  EmptyState,
  Message,
  PageHeader,
  Spinner,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useT } from "../../i18n";
import useFetch from "../../hooks/useFetch";
import { formatRWF } from "../../lib/format";

export default function SellerDashboardPage() {
  const t = useT();
  const { user } = useAuth();
  const shopQuery = useFetch("/shops/me");
  const shop = shopQuery.data?.shop;
  const listingsQuery = useFetch("/listings/mine", { enabled: Boolean(shop) });
  const connectionsQuery = useFetch("/connections/mine", { enabled: Boolean(shop) });
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  if (shopQuery.loading) {
    return <main className="min-h-[75vh] bg-loco-ice py-10"><Spinner label="Loading your shop..." /></main>;
  }

  if (!shop) {
    return (
      <main className="min-h-[75vh] bg-loco-ice py-10">
        <Container>
          <PageHeader eyebrow="Seller dashboard" title={`Welcome, ${user.name.split(" ")[0]}`} />
          <div className="rounded-3xl bg-loco-navy p-8 text-white sm:p-10">
            <Store size={38} className="text-loco-sky" />
            <h2 className="mt-5 text-2xl font-black sm:text-3xl">Set up your LOCO shop</h2>
            <p className="mt-2 max-w-xl text-white/75">Tell buyers who you are and where you are. It takes two minutes, then you can list new or second-hand products and services.</p>
            <Button as={Link} to="/seller/shop" variant="orange" className="mt-6"><Plus size={18} /> Create my shop</Button>
          </div>
        </Container>
      </main>
    );
  }

  const listings = listingsQuery.data?.listings || [];

  async function removeListing(listing) {
    if (!window.confirm(`Delete "${listing.name}"?`)) return;
    setBusy(listing.id);
    setError("");
    try {
      const response = await apiRequest(`/listings/${listing.id}`, { method: "DELETE" });
      setNotice(response.message);
      listingsQuery.refetch();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="min-h-[75vh] bg-loco-ice py-10">
      <Container>
        <PageHeader
          eyebrow="Seller dashboard"
          title={shop.name}
          description={<span className="inline-flex items-center gap-2">{shop.district}{shop.sector ? `, ${shop.sector}` : ""} {shop.verified ? <Badge tone="green"><BadgeCheck size={13} /> Verified</Badge> : <Badge tone="amber">Verification pending</Badge>}</span>}
          action={
            <div className="flex flex-wrap gap-2">
              <Button as={Link} to={`/shops/${shop.slug}`} variant="ghost"><Eye size={17} /> View shop</Button>
              <Button as={Link} to="/seller/shop" variant="outline"><Pencil size={17} /> Edit shop</Button>
              <Button as={Link} to="/seller/listings/new" variant="orange"><Plus size={17} /> New listing</Button>
            </div>
          }
        />

        {notice && <Message type="success" className="mb-4">{notice}</Message>}
        {error && <Message className="mb-4">{error}</Message>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Package} label="Active listings" value={listings.filter((item) => item.active).length} />
          <Stat icon={Link2} label={t("connections.stat")} value={connectionsQuery.data?.totals?.asSeller ?? 0} to="/connections" />
          <Stat icon={Eye} label="Listing views" value={listings.reduce((sum, item) => sum + (item.views || 0), 0)} />
          <Stat icon={Store} label="Second-hand items" value={listings.filter((item) => item.condition === "USED").length} />
          <Stat icon={Package} label="Services" value={listings.filter((item) => item.type === "SERVICE").length} />
        </div>

        <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-loco-ink">
          Buyers contact you on WhatsApp at the number on your shop. Keep it reachable and reply quickly.
        </section>

        {(connectionsQuery.data?.asSeller?.length ?? 0) > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-loco-navy">{t("connections.recent")}</h2>
              <Button as={Link} to="/connections" variant="ghost" size="sm">{t("connections.title")}</Button>
            </div>
            <ul className="divide-y divide-blue-50 overflow-hidden rounded-2xl border border-blue-100 bg-white">
              {connectionsQuery.data.asSeller.slice(0, 6).map((row) => (
                <li key={row.id} className="flex items-center gap-3 p-3 text-sm">
                  <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-loco-sky font-bold text-loco-navy">
                    {row.buyer?.avatarUrl ? <img src={row.buyer.avatarUrl} alt="" className="h-full w-full object-cover" /> : (row.buyer?.name || "?").charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <strong>{row.buyer?.name || t("connections.guest")}</strong>
                    {row.listing ? <> · {row.listing.name}</> : <> · {t("connections.aboutProfile")}</>}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">{row.channel === "CALL" ? t("connections.viaCall") : t("connections.viaWhatsapp")}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-black text-loco-navy">Your listings</h2>
          {listingsQuery.loading ? (
            <Spinner />
          ) : listings.length === 0 ? (
            <EmptyState icon={Package} title="No listings yet" description="Add the products and services you sell. Mark used items as second-hand with the original price so buyers see the saving." action={<Button as={Link} to="/seller/listings/new" variant="orange">Add your first listing</Button>} />
          ) : (
            <ul className="divide-y divide-blue-50 overflow-hidden rounded-2xl border border-blue-100 bg-white">
              {listings.map((listing) => (
                <li key={listing.id} className="flex items-center gap-4 p-4">
                  <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-loco-ice">
                    {listing.images?.[0]?.url ? <img src={listing.images[0].url} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center text-loco-navy/30"><ImageOff /></span>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link to={`/listings/${listing.slug}`} className="block truncate font-bold text-loco-ink hover:text-loco-navy">{listing.name}</Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="font-semibold text-loco-navy">{formatRWF(listing.price)}</span>
                      {listing.condition === "USED" && <Badge tone="blue">Second-hand</Badge>}
                      {listing.type === "SERVICE" && <Badge tone="mint">Service</Badge>}
                      {!listing.active && <Badge tone="red">Hidden</Badge>}
                      {listing.stock != null && <span>{listing.stock} in stock</span>}
                      <span>{listing.views} views</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-loco-sky-dark"><Link2 size={12} /> {t("connections.connectionsShort", { count: listing._count?.connections ?? 0 })}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button as={Link} to={`/seller/listings/${listing.id}/edit`} variant="ghost" size="sm" aria-label="Edit"><Pencil size={16} /></Button>
                    <Button variant="ghost" size="sm" className="text-red-600" aria-label="Delete" loading={busy === listing.id} onClick={() => removeListing(listing)}><Trash2 size={16} /></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </main>
  );
}

function Stat({ icon: Icon, label, value, to }) {
  const content = (
    <>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-loco-sky/20 text-loco-navy"><Icon size={22} /></span>
      <strong className="mt-4 block text-2xl font-black text-loco-navy">{value}</strong>
      <p className="mt-0.5 text-sm text-gray-500">{label}</p>
    </>
  );
  const className = "block rounded-2xl border border-blue-100 bg-white p-5 shadow-sm";
  return to ? <Link to={to} className={`${className} hover:border-loco-blue`}>{content}</Link> : <div className={className}>{content}</div>;
}
