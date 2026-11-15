import { ArrowLeft, Search, Store, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest, fieldErrorsFrom } from "../../api/api";
import { SingleImageUploader } from "../../components/ImageUploader";
import {
  Button,
  Container,
  DistrictSelect,
  Field,
  Input,
  Message,
  PageHeader,
  Spinner,
  Textarea,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { formatPhoneForDisplay } from "../../lib/rwanda";

const emptyOwner = { name: "", email: "", phone: "", password: "", district: "" };

// Sellers edit their own shop. With `admin`, an administrator creates or
// edits a shop for another person (an existing user or a new seller account).
export default function ShopFormPage({ admin = false }) {
  const t = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const endpoint = admin ? (id ? `/admin/shops/${id}` : null) : "/shops/me";
  const { data, loading } = useFetch(endpoint, { enabled: Boolean(endpoint) });
  const existing = data?.shop;
  const backTo = admin ? (id ? `/admin/shops/${id}` : "/admin") : "/seller";

  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: admin ? "" : formatPhoneForDisplay(user?.phone) || "",
    whatsapp: "",
    district: admin ? "" : user?.district || "",
    sector: "",
    address: "",
    logoUrl: "",
    coverUrl: "",
  });
  const [ownerMode, setOwnerMode] = useState("new");
  const [ownerQuery, setOwnerQuery] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [owner, setOwner] = useState(emptyOwner);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const searchEnabled = admin && !id && ownerMode === "existing" && ownerQuery.trim().length >= 2;
  const { data: matches } = useFetch(`/admin/users?q=${encodeURIComponent(ownerQuery.trim())}`, { enabled: searchEnabled });
  const candidates = searchEnabled ? (matches?.users || []).filter((item) => item.shops?.length === 0) : [];
  const picked = candidates.find((item) => item.id === ownerId);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || "",
        description: existing.description || "",
        phone: formatPhoneForDisplay(existing.phone) || "",
        whatsapp: formatPhoneForDisplay(existing.whatsapp) || "",
        district: existing.district || "",
        sector: existing.sector || "",
        address: existing.address || "",
        logoUrl: existing.logoUrl || "",
        coverUrl: existing.coverUrl || "",
      });
    }
  }, [existing]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function handleOwnerChange(event) {
    const { name, value } = event.target;
    setOwner((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [`owner.${name}`]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (admin && id) {
        await apiRequest(`/admin/shops/${id}`, { method: "PATCH", body: form });
        navigate(`/admin/shops/${id}`, { replace: true });
      } else if (admin) {
        const body = ownerMode === "existing" ? { ...form, ownerId } : { ...form, owner };
        const response = await apiRequest("/admin/shops", { method: "POST", body });
        navigate(`/admin/shops/${response.shop.id}`, { replace: true });
      } else if (existing) {
        await apiRequest("/shops/me", { method: "PATCH", body: form });
        navigate("/seller", { replace: true });
      } else {
        await apiRequest("/shops", { method: "POST", body: form });
        navigate("/seller", { replace: true });
      }
    } catch (requestError) {
      setErrors(fieldErrorsFrom(requestError));
      setError(requestError.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="min-h-[75vh] bg-loco-ice py-10"><Spinner /></main>;
  }

  const creatingForOwner = admin && !id;

  return (
    <main className="min-h-[75vh] bg-loco-ice py-10">
      <Container className="max-w-3xl">
        <Link to={backTo} className="inline-flex items-center gap-2 font-bold text-loco-navy"><ArrowLeft size={18} /> {admin ? "Administration" : t("nav.sellerDashboard")}</Link>

        <div className="mt-5 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-9">
          <PageHeader
            eyebrow={admin ? "Administration" : existing ? "Shop settings" : "Open your shop"}
            title={admin ? (id ? `Edit ${existing?.name || "shop"}` : "Add a shop for a seller") : existing ? "Edit your shop" : "Create your LOCO shop"}
            description={admin ? "The owner can log in afterwards and manage this shop and its products from their own seller portal." : "Buyers see this information on every listing. Use the name people in your area already know."}
          />

          {error && <Message className="mb-5">{error}</Message>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {creatingForOwner && (
              <fieldset className="rounded-2xl border border-blue-100 bg-loco-ice/60 p-4">
                <legend className="px-2 text-sm font-black text-loco-navy">Shop owner</legend>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "new", icon: UserPlus, label: "New seller account", text: "Create their login now" },
                    { key: "existing", icon: Users, label: "Existing user", text: "Someone already on LOCO" },
                  ].map((option) => (
                    <button key={option.key} type="button" onClick={() => setOwnerMode(option.key)} aria-pressed={ownerMode === option.key} className={`rounded-2xl border bg-white p-4 text-left ${ownerMode === option.key ? "border-loco-blue ring-2 ring-blue-100" : "border-gray-200 hover:border-loco-blue"}`}>
                      <strong className="flex items-center gap-2 text-loco-ink"><option.icon size={16} /> {option.label}</strong>
                      <span className="text-xs text-gray-500">{option.text}</span>
                    </button>
                  ))}
                </div>

                {ownerMode === "existing" ? (
                  <div className="mt-4 space-y-3">
                    <Field label="Find the user" htmlFor="ownerQuery" error={errors.ownerId} hint="Search by name, email or phone. Users who already own a shop are not listed.">
                      <div className="relative">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input id="ownerQuery" value={ownerQuery} onChange={(event) => { setOwnerQuery(event.target.value); setOwnerId(""); }} placeholder="e.g. Jeanne, 078..., name@example.com" className="pl-9" />
                      </div>
                    </Field>
                    {searchEnabled && (
                      <ul className="divide-y divide-blue-50 overflow-hidden rounded-xl border border-blue-100 bg-white">
                        {candidates.map((item) => (
                          <li key={item.id}>
                            <button type="button" onClick={() => setOwnerId(item.id)} className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-loco-ice ${ownerId === item.id ? "bg-loco-ice font-bold" : ""}`}>
                              <span className="min-w-0"><span className="block truncate text-loco-ink">{item.name}</span><span className="block truncate text-xs text-gray-500">{item.email} · {formatPhoneForDisplay(item.phone)}</span></span>
                              <span className="shrink-0 text-xs text-gray-400">{item.district || ""}</span>
                            </button>
                          </li>
                        ))}
                        {candidates.length === 0 && <li className="px-4 py-3 text-sm text-gray-500">No matching user without a shop.</li>}
                      </ul>
                    )}
                    {picked && <p className="text-sm text-loco-navy">Owner: <strong>{picked.name}</strong>{picked.role === "CUSTOMER" ? " (will become a seller)" : ""}</p>}
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Owner name" htmlFor="owner-name" error={errors["owner.name"]}>
                      <Input id="owner-name" name="name" value={owner.name} onChange={handleOwnerChange} placeholder="e.g. Jeanne Uwase" error={errors["owner.name"]} required />
                    </Field>
                    <Field label="Owner phone" htmlFor="owner-phone" error={errors["owner.phone"]}>
                      <Input id="owner-phone" name="phone" type="tel" value={owner.phone} onChange={handleOwnerChange} placeholder="078 123 4567" error={errors["owner.phone"]} required />
                    </Field>
                    <Field label="Owner email" htmlFor="owner-email" error={errors["owner.email"]} hint="They log in with this email.">
                      <Input id="owner-email" name="email" type="email" value={owner.email} onChange={handleOwnerChange} placeholder="name@example.com" error={errors["owner.email"]} required />
                    </Field>
                    <Field label="Temporary password" htmlFor="owner-password" error={errors["owner.password"]} hint="8+ characters with upper, lower case and a number. Share it with the owner.">
                      <Input id="owner-password" name="password" type="text" value={owner.password} onChange={handleOwnerChange} placeholder="e.g. Loco2026!" error={errors["owner.password"]} required />
                    </Field>
                  </div>
                )}
              </fieldset>
            )}

            <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
              <SingleImageUploader label={t("upload.logo")} value={form.logoUrl} onChange={(logoUrl) => setForm((c) => ({ ...c, logoUrl }))} shape="round" />
              <SingleImageUploader label={t("upload.cover")} value={form.coverUrl} onChange={(coverUrl) => setForm((c) => ({ ...c, coverUrl }))} shape="wide" />
            </div>

            <Field label="Shop name" htmlFor="name" error={errors.name}>
              <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Mama Jeanne Boutique, Kimironko Hardware" error={errors.name} required />
            </Field>

            <Field label="What does the shop sell?" htmlFor="description" optional error={errors.description}>
              <Textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange} placeholder="Groceries, drinks and airtime. Open every day 6am to 10pm. Moto delivery in Kimironko." />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Shop phone" htmlFor="phone" error={errors.phone} hint="Buyers call this number.">
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="078 123 4567" error={errors.phone} required />
              </Field>
              <Field label="WhatsApp number" htmlFor="whatsapp" optional error={errors.whatsapp} hint="Leave empty if it is the same as the phone.">
                <Input id="whatsapp" name="whatsapp" type="tel" value={form.whatsapp} onChange={handleChange} placeholder="078 123 4567" error={errors.whatsapp} />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("common.district")} htmlFor="district" error={errors.district}>
                <DistrictSelect id="district" name="district" value={form.district} onChange={handleChange} error={errors.district} placeholder={t("common.chooseDistrict")} required />
              </Field>
              <Field label="Sector" htmlFor="sector" optional error={errors.sector}>
                <Input id="sector" name="sector" value={form.sector} onChange={handleChange} placeholder="e.g. Kimironko" />
              </Field>
            </div>

            <Field label="Address or landmark" htmlFor="address" optional error={errors.address}>
              <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="e.g. KG 11 Ave, opposite the bus stop" />
            </Field>

            <Button type="submit" variant="orange" className="w-full" loading={submitting} disabled={creatingForOwner && ownerMode === "existing" && !ownerId}>
              <Store size={18} /> {submitting ? t("common.saving") : existing ? t("common.save") : "Create shop"}
            </Button>
          </form>
        </div>
      </Container>
    </main>
  );
}
