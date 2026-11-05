import { ArrowLeft, MapPin, MessageCircle, Phone, Store } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiRequest } from "../../api/api";
import {
  Badge,
  Button,
  Container,
  EmptyState,
  Message,
  Spinner,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { formatDate, formatRWF, ORDER_STATUS, PAYMENT_PROVIDERS, titleCase } from "../../lib/format";
import { formatPhoneForDisplay, whatsappLink } from "../../lib/rwanda";

const SELLER_NEXT = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "OUT_FOR_DELIVERY"],
  READY: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const STEPS = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { data, loading, error, setData } = useFetch(`/orders/${id}`);
  const [notice, setNotice] = useState(location.state?.message || "");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) {
    return <main className="min-h-[75vh] bg-loco-cream py-10"><Spinner label="Loading order..." /></main>;
  }

  if (error || !data?.order) {
    return (
      <main className="min-h-[75vh] bg-loco-cream py-10">
        <Container><EmptyState title="Order not found" action={<Button as={Link} to="/orders">My orders</Button>} /></Container>
      </main>
    );
  }

  const order = data.order;
  const status = ORDER_STATUS[order.status];
  const isSeller = order.shop.ownerId === user?.id;
  const isCustomer = order.customer.id === user?.id;
  const stepIndex = order.status === "READY" ? 2 : STEPS.indexOf(order.status);

  async function setStatus(next) {
    setBusy(true);
    setActionError("");
    try {
      const response = await apiRequest(`/orders/${order.id}/status`, { method: "PATCH", body: { status: next } });
      setData({ order: response.order });
      setNotice(response.message);
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  const contactPhone = isSeller ? order.customerPhone || order.customer.phone : order.shop.phone;
  const whatsapp = whatsappLink(isSeller ? contactPhone : order.shop.whatsapp || order.shop.phone, `Hello, about LOCO order ${order.reference}`);

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <Link to={isSeller && !isCustomer ? "/seller/orders" : "/orders"} className="inline-flex items-center gap-2 font-bold text-loco-wine">
          <ArrowLeft size={18} /> {isSeller && !isCustomer ? "Shop orders" : "My orders"}
        </Link>

        {notice && <Message type="success" className="mt-5">{notice}</Message>}
        {actionError && <Message className="mt-5">{actionError}</Message>}

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Order {order.reference}</p>
                  <h1 className="mt-1 text-2xl font-black text-loco-wine">{formatRWF(order.total)}</h1>
                  <p className="text-sm text-gray-500">Placed {formatDate(order.createdAt, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <Badge tone={status.tone} className="text-sm">{status.label}</Badge>
              </div>

              {order.status !== "CANCELLED" && (
                <ol className="mt-6 grid grid-cols-5 gap-1 text-center text-[11px] font-bold sm:text-xs">
                  {STEPS.map((step, index) => (
                    <li key={step} className={index <= stepIndex ? "text-loco-wine" : "text-gray-300"}>
                      <span className={`mx-auto mb-1.5 block h-2 rounded-full ${index <= stepIndex ? "bg-loco-orange" : "bg-gray-200"}`} />
                      {titleCase(step)}
                    </li>
                  ))}
                </ol>
              )}

              <ul className="mt-6 divide-y divide-orange-50">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-3">
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-loco-cream">
                      {item.listing?.images?.[0]?.url && <img src={item.listing.images[0].url} alt="" className="h-full w-full object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link to={`/listings/${item.listing?.slug}`} className="block truncate font-semibold hover:text-loco-wine">{item.name}</Link>
                      <span className="text-sm text-gray-500">{item.quantity} × {formatRWF(item.unitPrice)}</span>
                    </span>
                    <strong>{formatRWF(item.unitPrice * item.quantity)}</strong>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-1.5 border-t border-orange-100 pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Subtotal</dt><dd>{formatRWF(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Moto delivery</dt><dd>{formatRWF(order.deliveryFee)}</dd></div>
                <div className="flex justify-between font-black text-loco-wine"><dt>Total</dt><dd>{formatRWF(order.total)}</dd></div>
              </dl>
            </section>

            {isSeller && SELLER_NEXT[order.status].length > 0 && (
              <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                <h2 className="font-black text-loco-wine">Update this order</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SELLER_NEXT[order.status].map((next) => (
                    <Button key={next} size="sm" variant={next === "CANCELLED" ? "danger" : "primary"} loading={busy} onClick={() => setStatus(next)}>
                      Mark {ORDER_STATUS[next].label.toLowerCase()}
                    </Button>
                  ))}
                </div>
              </section>
            )}

            {isCustomer && order.status === "PENDING" && (
              <Button variant="danger" size="sm" loading={busy} onClick={() => setStatus("CANCELLED")}>Cancel order</Button>
            )}
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <h2 className="inline-flex items-center gap-2 font-black text-loco-wine"><MapPin size={18} /> Delivery</h2>
              <p className="mt-3 font-semibold">{order.deliveryDistrict}</p>
              <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
              <p className="mt-2 text-sm text-gray-600">Phone: {formatPhoneForDisplay(order.customerPhone)}</p>
              {order.note && <p className="mt-3 rounded-xl bg-loco-cream p-3 text-sm text-gray-700">"{order.note}"</p>}
            </section>

            <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <h2 className="font-black text-loco-wine">Payment</h2>
              <p className="mt-2 font-semibold">{PAYMENT_PROVIDERS[order.payment?.provider]}</p>
              <Badge tone={order.payment?.status === "PAID" ? "green" : "amber"} className="mt-2">{titleCase(order.payment?.status)}</Badge>
            </section>

            <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <h2 className="inline-flex items-center gap-2 font-black text-loco-wine"><Store size={18} /> {isSeller ? "Customer" : "Shop"}</h2>
              <p className="mt-2 font-semibold">{isSeller ? order.customer.name : <Link to={`/shops/${order.shop.slug}`} className="hover:text-loco-wine">{order.shop.name}</Link>}</p>
              <div className="mt-3 flex flex-col gap-2">
                {contactPhone && <Button as="a" href={`tel:${contactPhone}`} variant="outline" size="sm"><Phone size={15} /> {formatPhoneForDisplay(contactPhone)}</Button>}
                {whatsapp && <Button as="a" href={whatsapp} target="_blank" rel="noreferrer" variant="mint" size="sm"><MessageCircle size={15} /> WhatsApp</Button>}
              </div>
            </section>
          </aside>
        </div>
      </Container>
    </main>
  );
}
