import {
  BadgeCheck,
  Eye,
  ImageOff,
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
import useFetch from "../../hooks/useFetch";
import { formatRWF } from "../../lib/format";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const shopQuery = useFetch("/shops/me");
  const shop = shopQuery.data?.shop;
  const listingsQuery = useFetch("/listings/mine", { enabled: Boolean(shop) });
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  if (shopQuery.loading) {
    return <main className="min-h-[75vh] bg-loco-cream py-10"><Spinner label="Loading your shop..." /></main>;
  }

  if (!shop) {
    return (
      <main className="min-h-[75vh] bg-loco-cream py-10">
        <Container>
          <PageHeader eyebrow="Seller dashboard" title={`Welcome, ${user.name.split(" ")[0]}`} />
          <div className="rounded-3xl bg-loco-wine p-8 text-white sm:p-10">
            <Store size={38} className="text-loco-mint" />
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
    <main className="min-h-[75vh] bg-loco-cream py-10">
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
          <Stat icon={Eye} label="Listing views" value={listings.reduce((sum, item) => sum + (item.views || 0), 0)} />
          <Stat icon={Store} label="Second-hand items" value={listings.filter((item) => item.condition === "USED").length} />
          <Stat icon={Package} label="Services" value={listings.filter((item) => item.type === "SERVICE").length} />
        </div>

        <section className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm text-loco-ink">
          Buyers contact you on WhatsApp at the number on your shop. Keep it reachable and reply quickly.
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-black text-loco-wine">Your listings</h2>
          {listingsQuery.loading ? (
            <Spinner />
          ) : listings.length === 0 ? (
            <EmptyState icon={Package} title="No listings yet" description="Add the products and services you sell. Mark used items as second-hand with the original price so buyers see the saving." action={<Button as={Link} to="/seller/listings/new" variant="orange">Add your first listing</Button>} />
          ) : (
            <ul className="divide-y divide-orange-50 overflow-hidden rounded-2xl border border-orange-100 bg-white">
              {listings.map((listing) => (
                <li key={listing.id} className="flex items-center gap-4 p-4">
                  <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-loco-cream">
                    {listing.images?.[0]?.url ? <img src={listing.images[0].url} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center text-loco-wine/30"><ImageOff /></span>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link to={`/listings/${listing.slug}`} className="block truncate font-bold text-loco-ink hover:text-loco-wine">{listing.name}</Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="font-semibold text-loco-wine">{formatRWF(listing.price)}</span>
                      {listing.condition === "USED" && <Badge tone="blue">Second-hand</Badge>}
                      {listing.type === "SERVICE" && <Badge tone="mint">Service</Badge>}
                      {!listing.active && <Badge tone="red">Hidden</Badge>}
                      {listing.stock != null && <span>{listing.stock} in stock</span>}
                      <span>{listing.views} views</span>
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
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-loco-mint/20 text-loco-wine"><Icon size={22} /></span>
      <strong className="mt-4 block text-2xl font-black text-loco-wine">{value}</strong>
      <p className="mt-0.5 text-sm text-gray-500">{label}</p>
    </>
  );
  const className = "block rounded-2xl border border-orange-100 bg-white p-5 shadow-sm";
  return to ? <Link to={to} className={`${className} hover:border-loco-orange`}>{content}</Link> : <div className={className}>{content}</div>;
}
