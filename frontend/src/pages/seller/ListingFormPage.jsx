import { ArrowLeft, Package } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest, fieldErrorsFrom } from "../../api/api";
import ImageUploader from "../../components/ImageUploader";
import {
  Button,
  Container,
  DistrictSelect,
  Field,
  Input,
  Message,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { discountPercent, formatRWF } from "../../lib/format";

const initial = {
  name: "",
  description: "",
  kind: "GOODS",
  categoryId: "",
  condition: "NEW",
  price: "",
  originalPrice: "",
  unit: "",
  negotiable: false,
  stock: "",
  district: "",
  active: true,
  imageUrls: [],
};

export default function ListingFormPage() {
  const t = useT();
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: goods } = useFetch("/categories?kind=GOODS");
  const { data: services } = useFetch("/categories?kind=SERVICES");
  const { data: mine, loading } = useFetch("/listings/mine", { enabled: editing });

  const categories = useMemo(
    () => (form.kind === "SERVICES" ? services?.categories : goods?.categories) || [],
    [form.kind, goods, services]
  );

  useEffect(() => {
    if (!editing || !mine) return;
    const listing = mine.listings.find((item) => item.id === id);
    if (!listing) {
      navigate("/seller", { replace: true });
      return;
    }
    setForm({
      name: listing.name,
      description: listing.description || "",
      kind: listing.type === "SERVICE" ? "SERVICES" : "GOODS",
      categoryId: listing.categoryId,
      condition: listing.condition,
      price: listing.price,
      originalPrice: listing.originalPrice ?? "",
      unit: listing.unit || "",
      negotiable: listing.negotiable,
      stock: listing.stock ?? "",
      district: listing.district || "",
      active: listing.active,
      imageUrls: (listing.images || []).map((image) => image.url),
    });
  }, [editing, mine, id, navigate]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const body = {
      name: form.name,
      description: form.description,
      type: form.kind === "SERVICES" ? "SERVICE" : "PRODUCT",
      condition: form.kind === "SERVICES" ? "NEW" : form.condition,
      price: Number(form.price),
      originalPrice: form.condition === "USED" && form.originalPrice !== "" ? Number(form.originalPrice) : null,
      unit: form.unit,
      negotiable: Boolean(form.negotiable),
      stock: form.kind === "SERVICES" || form.stock === "" ? null : Number(form.stock),
      categoryId: form.categoryId,
      district: form.district || undefined,
      active: Boolean(form.active),
      imageUrls: form.imageUrls,
    };

    try {
      if (editing) {
        await apiRequest(`/listings/${id}`, { method: "PATCH", body });
      } else {
        await apiRequest("/listings", { method: "POST", body });
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

  if (editing && loading) {
    return <main className="min-h-[75vh] bg-loco-ice py-10"><Spinner /></main>;
  }

  const discount = discountPercent(form.originalPrice, form.price);
  const isService = form.kind === "SERVICES";

  return (
    <main className="min-h-[75vh] bg-loco-ice py-10">
      <Container className="max-w-3xl">
        <Link to="/seller" className="inline-flex items-center gap-2 font-bold text-loco-navy"><ArrowLeft size={18} /> {t("nav.sellerDashboard")}</Link>

        <div className="mt-5 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-9">
          <PageHeader eyebrow={editing ? "Edit listing" : "New listing"} title={editing ? "Update listing" : "What are you selling?"} />

          {error && <Message className="mb-5">{error}</Message>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "GOODS", label: "A product", text: "New or second-hand item" },
                { key: "SERVICES", label: "A service", text: "Work you do for customers" },
              ].map((option) => (
                <button key={option.key} type="button" onClick={() => setForm((c) => ({ ...c, kind: option.key, categoryId: "" }))} aria-pressed={form.kind === option.key} className={`rounded-2xl border p-4 text-left ${form.kind === option.key ? "border-loco-blue bg-blue-50 ring-2 ring-blue-100" : "border-gray-200 hover:border-loco-blue"}`}>
                  <strong className="block text-loco-ink">{option.label}</strong>
                  <span className="text-xs text-gray-500">{option.text}</span>
                </button>
              ))}
            </div>

            {!isService && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "NEW", label: "New", text: "Sold in your shop as new" },
                  { key: "USED", label: "Second-hand", text: "Used item at a lower price" },
                ].map((option) => (
                  <button key={option.key} type="button" onClick={() => setForm((c) => ({ ...c, condition: option.key }))} aria-pressed={form.condition === option.key} className={`rounded-2xl border p-4 text-left ${form.condition === option.key ? "border-loco-sky bg-emerald-50 ring-2 ring-emerald-100" : "border-gray-200 hover:border-loco-sky"}`}>
                    <strong className="block text-loco-ink">{option.label}</strong>
                    <span className="text-xs text-gray-500">{option.text}</span>
                  </button>
                ))}
              </div>
            )}

            <ImageUploader label={t("upload.photos")} value={form.imageUrls} onChange={(imageUrls) => setForm((c) => ({ ...c, imageUrls }))} max={6} />

            <Field label="Name" htmlFor="name" error={errors.name}>
              <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder={isService ? "e.g. Plumbing repairs, home visits in Gasabo" : "e.g. Inyange milk 1L, Samsung A12 (used)"} error={errors.name} required />
            </Field>

            <Field label="Category" htmlFor="categoryId" error={errors.categoryId}>
              <Select id="categoryId" name="categoryId" value={form.categoryId} onChange={handleChange} error={errors.categoryId} required>
                <option value="">Choose a category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </Select>
            </Field>

            <Field label="Description" htmlFor="description" optional error={errors.description}>
              <Textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange} placeholder={form.condition === "USED" ? "How old is it? Any scratches or faults? Why are you selling?" : "Size, brand, what is included, opening hours..."} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label={isService ? "Price from (RWF)" : "Price (RWF)"} htmlFor="price" error={errors.price}>
                <Input id="price" name="price" type="number" min="0" step="50" value={form.price} onChange={handleChange} placeholder="1200" error={errors.price} required />
              </Field>
              {form.condition === "USED" && !isService ? (
                <Field label="Price when new (RWF)" htmlFor="originalPrice" optional error={errors.originalPrice} hint={discount > 0 ? `Buyers see "Save ${discount}%"` : "Shows buyers how much they save."}>
                  <Input id="originalPrice" name="originalPrice" type="number" min="0" step="50" value={form.originalPrice} onChange={handleChange} placeholder="120000" error={errors.originalPrice} />
                </Field>
              ) : (
                <Field label="Unit" htmlFor="unit" optional error={errors.unit}>
                  <Input id="unit" name="unit" value={form.unit} onChange={handleChange} placeholder={isService ? "visit, hour, job" : "kg, piece, bottle"} />
                </Field>
              )}
              {!isService && (
                <Field label="Stock" htmlFor="stock" optional error={errors.stock} hint="Leave empty for unlimited.">
                  <Input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder={form.condition === "USED" ? "1" : "20"} error={errors.stock} />
                </Field>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("common.district")} htmlFor="district" optional error={errors.district} hint="Leave empty to use your shop's district.">
                <DistrictSelect id="district" name="district" value={form.district} onChange={handleChange} placeholder={t("common.sameAsShop")} />
              </Field>
              <div className="flex flex-col justify-end gap-3 pb-1">
                <label className="flex items-center gap-3 text-sm font-semibold">
                  <input type="checkbox" name="negotiable" checked={form.negotiable} onChange={handleChange} className="h-4 w-4 accent-loco-navy" /> {t("common.negotiable")}
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold">
                  <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="h-4 w-4 accent-loco-navy" /> Visible to buyers
                </label>
              </div>
            </div>

            {form.price && (
              <p className="rounded-xl bg-loco-ice p-3 text-sm text-gray-700">
                Buyers will see <strong className="text-loco-navy">{formatRWF(form.price)}</strong>{form.unit ? ` per ${form.unit}` : ""}{discount > 0 ? ` with a ${discount}% saving badge` : ""}.
              </p>
            )}

            <Button type="submit" variant="orange" className="w-full" loading={submitting}>
              <Package size={18} /> {submitting ? t("common.saving") : editing ? t("common.save") : "Publish listing"}
            </Button>
          </form>
        </div>
      </Container>
    </main>
  );
}
