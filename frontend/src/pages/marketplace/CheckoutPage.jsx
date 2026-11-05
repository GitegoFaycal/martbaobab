import { Banknote, Smartphone, Truck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, fieldErrorsFrom } from "../../api/api";
import { Button, Container, DistrictSelect, EmptyState, Field, Input, Message, PageHeader, Textarea } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useT } from "../../i18n";
import { formatRWF, paymentLabel } from "../../lib/format";
import { formatPhoneForDisplay } from "../../lib/rwanda";

export default function CheckoutPage() {
  const t = useT();
  const { user } = useAuth();
  const { shop, items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerPhone: formatPhoneForDisplay(user?.phone) || "",
    deliveryDistrict: user?.district || shop?.district || "",
    deliveryAddress: "",
    note: "",
    paymentProvider: "MTN_MOMO",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <main className="min-h-[75vh] bg-loco-cream py-10">
        <Container><EmptyState title={t("checkout.nothing")} description={t("checkout.emptyCart")} action={<Button as={Link} to="/shop">{t("listing.backToShop")}</Button>} /></Container>
      </main>
    );
  }

  const providers = [
    { key: "MTN_MOMO", icon: Smartphone, text: t("checkout.momoText") },
    { key: "AIRTEL_MONEY", icon: Smartphone, text: t("checkout.airtelText") },
    { key: "CASH_ON_DELIVERY", icon: Banknote, text: t("checkout.cashText") },
  ];

  const deliveryFee = form.deliveryDistrict && form.deliveryDistrict === shop.district ? 1000 : 2500;
  const total = subtotal + deliveryFee;

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
      const response = await apiRequest("/orders", {
        method: "POST",
        body: { shopId: shop.id, items: items.map((item) => ({ listingId: item.id, quantity: item.quantity })), ...form },
      });
      clearCart();
      navigate(`/orders/${response.order.id}`, { replace: true, state: { message: response.message } });
    } catch (requestError) {
      setErrors(fieldErrorsFrom(requestError));
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <PageHeader eyebrow={t("checkout.eyebrow")} title={t("checkout.title")} description={t("checkout.orderingFrom", { shop: `${shop.name}${shop.district ? `, ${shop.district}` : ""}` })} />

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
              <h2 className="inline-flex items-center gap-2 font-black text-loco-wine"><Truck size={19} /> {t("checkout.delivery")}</h2>
              {error && <Message className="mt-4">{error}</Message>}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label={t("checkout.phone")} htmlFor="customerPhone" error={errors.customerPhone} hint={t("checkout.phoneHint")}>
                  <Input id="customerPhone" name="customerPhone" type="tel" value={form.customerPhone} onChange={handleChange} placeholder="078 123 4567" error={errors.customerPhone} required />
                </Field>
                <Field label={t("checkout.district")} htmlFor="deliveryDistrict" error={errors.deliveryDistrict}>
                  <DistrictSelect id="deliveryDistrict" name="deliveryDistrict" value={form.deliveryDistrict} onChange={handleChange} error={errors.deliveryDistrict} placeholder={t("common.chooseDistrict")} required />
                </Field>
              </div>
              <div className="mt-5">
                <Field label={t("checkout.where")} htmlFor="deliveryAddress" error={errors.deliveryAddress} hint={t("checkout.whereHint")}>
                  <Input id="deliveryAddress" name="deliveryAddress" value={form.deliveryAddress} onChange={handleChange} placeholder={t("checkout.wherePh")} error={errors.deliveryAddress} required />
                </Field>
              </div>
              <div className="mt-5">
                <Field label={t("checkout.note")} htmlFor="note" optional error={errors.note}>
                  <Textarea id="note" name="note" rows={3} value={form.note} onChange={handleChange} placeholder={t("checkout.notePh")} />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
              <h2 className="inline-flex items-center gap-2 font-black text-loco-wine"><Banknote size={19} /> {t("checkout.payment")}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {providers.map(({ key, icon: Icon, text }) => (
                  <label key={key} className={`cursor-pointer rounded-2xl border p-4 ${form.paymentProvider === key ? "border-loco-orange bg-orange-50 ring-2 ring-orange-100" : "border-gray-200 hover:border-loco-orange"}`}>
                    <input type="radio" name="paymentProvider" value={key} checked={form.paymentProvider === key} onChange={handleChange} className="sr-only" />
                    <Icon size={22} className={form.paymentProvider === key ? "text-loco-orange" : "text-gray-400"} />
                    <strong className="mt-3 block text-sm text-loco-ink">{paymentLabel(key, t)}</strong>
                    <span className="mt-1 block text-xs leading-5 text-gray-500">{text}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-orange-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="font-black text-loco-wine">{t("checkout.yourOrder")}</h2>
            <ul className="mt-4 divide-y divide-orange-50 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-2"><span className="min-w-0 truncate">{item.quantity} × {item.name}</span><span className="shrink-0 font-semibold">{formatRWF(item.price * item.quantity)}</span></li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-orange-100 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">{t("cart.subtotal")}</dt><dd className="font-semibold">{formatRWF(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">{t("cart.delivery")}</dt><dd className="font-semibold">{formatRWF(deliveryFee)}</dd></div>
              <div className="flex justify-between text-base"><dt className="font-bold text-loco-ink">{t("checkout.total")}</dt><dd className="font-black text-loco-wine">{formatRWF(total)}</dd></div>
            </dl>
            <Button type="submit" variant="orange" className="mt-6 w-full" loading={submitting}>{submitting ? t("checkout.placing") : t("checkout.placeOrder", { total: formatRWF(total) })}</Button>
            <p className="mt-3 text-center text-xs text-gray-400">{t("checkout.terms")}</p>
          </aside>
        </form>
      </Container>
    </main>
  );
}
