import { ArrowLeft, BadgeCheck, ExternalLink, ImageOff, Link2, MapPin, Package, Pencil, Plus, Trash2, UserRound, UserRoundCog } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest, fieldErrorsFrom } from "../../api/api";
import OwnerPicker from "../../components/admin/OwnerPicker";
import { Badge, Button, Container, EmptyState, Message, Spinner } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { formatRWF } from "../../lib/format";
import { formatPhoneForDisplay } from "../../lib/rwanda";

// Administrator view of one shop: owner details, verification and the
// product list, with the same add / edit / delete actions the owner has.
export default function AdminShopPage() {
  const t = useT();
  const { id } = useParams();
  const { data, loading, error: loadError, refetch } = useFetch(`/admin/shops/${id}`);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [ownerChoice, setOwnerChoice] = useState({ mode: "new", ownerId: "", owner: null, ready: false });
  const [ownerErrors, setOwnerErrors] = useState({});

  const shop = data?.shop;
  const listings = shop?.listings || [];
  const isPlaceholder = Boolean(shop?.owner?.email?.endsWith("@shops.loco.rw"));

  async function toggleVerified() {
    setBusy("verify");
    setError("");
    try {
      await apiRequest(`/admin/shops/${id}/verify`, { method: "PATCH", body: { verified: !shop.verified } });
      refetch();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  }

  async function assignOwner(event) {
    event.preventDefault();
    setBusy("owner");
    setError("");
    setOwnerErrors({});
    try {
      const body = ownerChoice.mode === "existing" ? { ownerId: ownerChoice.ownerId } : { owner: ownerChoice.owner };
      const response = await apiRequest(`/admin/shops/${id}/owner`, { method: "PATCH", body });
      setNotice(response.message);
      setAssigning(false);
      refetch();
    } catch (requestError) {
      setOwnerErrors(fieldErrorsFrom(requestError));
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  }

  async function removeListing(listing) {
    if (!window.confirm(`Delete "${listing.name}" from ${shop.name}?`)) return;
    setBusy(listing.id);
    setError("");
    try {
      const response = await apiRequest(`/listings/${listing.id}`, { method: "DELETE" });
      setNotice(response.message);
      refetch();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  }

  if (loading) {
    return <main className="min-h-[75vh] bg-loco-ice py-10"><Spinner /></main>;
  }

  if (loadError || !shop) {
    return (
      <main className="min-h-[75vh] bg-loco-ice py-10">
        <Container><EmptyState title="Shop not found" description={loadError} action={<Button as={Link} to="/admin">Back to administration</Button>} /></Container>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-loco-ice py-10">
      <Container>
        <Link to="/admin" className="inline-flex items-center gap-2 font-bold text-loco-navy"><ArrowLeft size={18} /> Administration</Link>

        {error && <Message className="mt-4">{error}</Message>}
        {notice && <Message type="success" className="mt-4">{notice}</Message>}

        <section className="mt-5 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
          <div className="h-32 bg-linear-to-r from-loco-navy to-loco-blue">
            {shop.coverUrl && <img src={shop.coverUrl} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
            <span className="-mt-14 h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-loco-ice ring-4 ring-white shadow">
              {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center text-2xl font-black text-loco-navy">{shop.name.charAt(0)}</span>}
            </span>

            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-black text-loco-navy">
                {shop.name}
                {shop.verified ? <Badge tone="green"><BadgeCheck size={12} /> Verified</Badge> : <Badge tone="amber">Pending</Badge>}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={14} className="text-loco-blue" /> {shop.district}{shop.sector ? `, ${shop.sector}` : ""}{shop.address ? ` · ${shop.address}` : ""}</p>
              <p className="mt-1 text-sm text-gray-500">{formatPhoneForDisplay(shop.phone)}{shop.whatsapp && shop.whatsapp !== shop.phone ? ` · WhatsApp ${formatPhoneForDisplay(shop.whatsapp)}` : ""}</p>
              {shop.description && <p className="mt-3 max-w-2xl text-sm text-gray-700">{shop.description}</p>}

              <div className="mt-4 rounded-2xl bg-loco-ice p-4 text-sm">
                <p className="flex items-center gap-2 font-bold text-loco-navy"><UserRound size={16} /> Owner</p>
                <p className="mt-1 text-loco-ink">{shop.owner.name} <span className="text-gray-500">· {shop.owner.email} · {formatPhoneForDisplay(shop.owner.phone)}</span></p>
                <p className="mt-1 text-xs text-gray-500">{isPlaceholder ? "Placeholder account from the shop list. Assign the real owner so they can log in and add products." : "The owner manages this same shop from their seller portal after logging in."}</p>
                <Button variant={isPlaceholder ? "orange" : "outline"} size="sm" className="mt-3" onClick={() => setAssigning((current) => !current)}><UserRoundCog size={15} /> {assigning ? "Cancel" : "Assign owner"}</Button>
              </div>

              {assigning && (
                <form onSubmit={assignOwner} className="mt-4 rounded-2xl border border-blue-100 bg-white p-4">
                  <h2 className="mb-3 text-sm font-black text-loco-navy">New owner of {shop.name}</h2>
                  <OwnerPicker onChange={setOwnerChoice} errors={ownerErrors} excludeUserId={shop.owner.id} />
                  <p className="mt-3 text-xs text-gray-500">{isPlaceholder ? "The placeholder account is disabled once the shop is handed over." : `${shop.owner.name} keeps their account but no longer manages this shop.`}</p>
                  <Button type="submit" variant="orange" className="mt-3" loading={busy === "owner"} disabled={!ownerChoice.ready}>Hand over the shop</Button>
                </form>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:w-52">
              <Button as={Link} to={`/admin/shops/${id}/listings/new`} variant="orange"><Plus size={17} /> Add product</Button>
              <Button as={Link} to={`/admin/shops/${id}/edit`} variant="outline"><Pencil size={17} /> Edit shop</Button>
              <Button variant={shop.verified ? "ghost" : "mint"} loading={busy === "verify"} onClick={toggleVerified}>{shop.verified ? "Remove verification" : "Verify shop"}</Button>
              <Button as={Link} to={`/shops/${shop.slug}`} variant="ghost"><ExternalLink size={16} /> View public page</Button>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-black text-loco-navy">Products and services ({listings.length})</h2>
          {listings.length === 0 ? (
            <EmptyState icon={Package} title="No listings yet" description="Add the products and services this shop sells. The owner can add more later." action={<Button as={Link} to={`/admin/shops/${id}/listings/new`} variant="orange">Add the first product</Button>} />
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
                      {listing.category && <span>{listing.category.name}</span>}
                      {listing.condition === "USED" && <Badge tone="blue">Second-hand</Badge>}
                      {listing.type === "SERVICE" && <Badge tone="mint">Service</Badge>}
                      {!listing.active && <Badge tone="red">Hidden</Badge>}
                      <span>{listing.views} views</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-loco-sky-dark"><Link2 size={12} /> {t("connections.connectionsShort", { count: listing._count?.connections ?? 0 })}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button as={Link} to={`/admin/shops/${id}/listings/${listing.id}/edit`} variant="ghost" size="sm" aria-label="Edit"><Pencil size={16} /></Button>
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
