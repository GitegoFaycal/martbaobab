import { ArrowLeft, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function ShopFormPage() {
  const t = useT();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading } = useFetch("/shops/me");
  const existing = data?.shop;

  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: formatPhoneForDisplay(user?.phone) || "",
    whatsapp: "",
    district: user?.district || "",
    sector: "",
    address: "",
    logoUrl: "",
    coverUrl: "",
  });
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
      if (existing) {
        await apiRequest("/shops/me", { method: "PATCH", body: form });
      } else {
        await apiRequest("/shops", { method: "POST", body: form });
      }
      navigate("/seller", { replace: true });
    } catch (requestError) {
      setErrors(fieldErrorsFrom(requestError));
      setError(requestError.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="min-h-[75vh] bg-loco-cream py-10"><Spinner /></main>;
  }

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container className="max-w-3xl">
        <Link to="/seller" className="inline-flex items-center gap-2 font-bold text-loco-wine"><ArrowLeft size={18} /> {t("nav.sellerDashboard")}</Link>

        <div className="mt-5 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-9">
          <PageHeader eyebrow={existing ? "Shop settings" : "Open your shop"} title={existing ? "Edit your shop" : "Create your LOCO shop"} description="Buyers see this information on every listing. Use the name people in your area already know." />

          {error && <Message className="mb-5">{error}</Message>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
              <SingleImageUploader label={t("upload.logo")} value={form.logoUrl} onChange={(logoUrl) => setForm((c) => ({ ...c, logoUrl }))} shape="round" />
              <SingleImageUploader label={t("upload.cover")} value={form.coverUrl} onChange={(coverUrl) => setForm((c) => ({ ...c, coverUrl }))} shape="wide" />
            </div>

            <Field label="Shop name" htmlFor="name" error={errors.name}>
              <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Mama Jeanne Boutique, Kimironko Hardware" error={errors.name} required />
            </Field>

            <Field label="What do you sell?" htmlFor="description" optional error={errors.description}>
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

            <Button type="submit" variant="orange" className="w-full" loading={submitting}>
              <Store size={18} /> {submitting ? t("common.saving") : existing ? t("common.save") : "Create shop"}
            </Button>
          </form>
        </div>
      </Container>
    </main>
  );
}
