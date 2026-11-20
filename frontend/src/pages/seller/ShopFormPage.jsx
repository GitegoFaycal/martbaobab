import { ArrowLeft, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest, fieldErrorsFrom } from "../../api/api";
import OwnerPicker from "../../components/admin/OwnerPicker";
import LocationPicker from "../../components/LocationPicker";
import { SingleImageUploader } from "../../components/ImageUploader";
import {
  Button,
  Container,
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
    cell: "",
    village: "",
    address: "",
    logoUrl: "",
    coverUrl: "",
  });
  const [ownerChoice, setOwnerChoice] = useState({ mode: "new", ownerId: "", owner: null, ready: false });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || "",
        description: existing.description || "",
        phone: formatPhoneForDisplay(existing.phone) || "",
        whatsapp: formatPhoneForDisplay(existing.whatsapp) || "",
        district: existing.district || "",
        sector: existing.sector || "",
        cell: existing.cell || "",
        village: existing.village || "",
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

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (admin && id) {
        await apiRequest(`/admin/shops/${id}`, { method: "PATCH", body: form });
        navigate(`/admin/shops/${id}`, { replace: true });
      } else if (admin) {
        const body = ownerChoice.mode === "existing" ? { ...form, ownerId: ownerChoice.ownerId } : { ...form, owner: ownerChoice.owner };
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
                <OwnerPicker onChange={setOwnerChoice} errors={errors} />
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

            <Field label="Where is the shop?" htmlFor="district" error={errors.district || errors.sector || errors.cell || errors.village} hint="District, then sector, cell and village, so buyers nearby find you.">
              <LocationPicker value={form} onChange={(place) => { setForm((c) => ({ ...c, ...place })); setErrors((c) => ({ ...c, district: "" })); }} className="sm:grid-cols-2" />
            </Field>

            <Field label="Address or landmark" htmlFor="address" optional error={errors.address}>
              <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="e.g. KG 11 Ave, opposite the bus stop" />
            </Field>

            <Button type="submit" variant="orange" className="w-full" loading={submitting} disabled={creatingForOwner && !ownerChoice.ready}>
              <Store size={18} /> {submitting ? t("common.saving") : existing ? t("common.save") : "Create shop"}
            </Button>
          </form>
        </div>
      </Container>
    </main>
  );
}
