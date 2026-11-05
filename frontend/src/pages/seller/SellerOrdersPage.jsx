import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Container,
  EmptyState,
  Message,
  PageHeader,
  Spinner,
} from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { formatDate, formatRWF, ORDER_STATUS, PAYMENT_PROVIDERS } from "../../lib/format";

const TABS = [
  { key: "active", label: "To handle", statuses: ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"] },
  { key: "done", label: "Delivered", statuses: ["DELIVERED"] },
  { key: "cancelled", label: "Cancelled", statuses: ["CANCELLED"] },
];

export default function SellerOrdersPage() {
  const { data, loading, error } = useFetch("/orders/shop");
  const [tab, setTab] = useState(TABS[0]);
  const orders = (data?.orders || []).filter((order) => tab.statuses.includes(order.status));

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <Link to="/seller" className="inline-flex items-center gap-2 font-bold text-loco-wine"><ArrowLeft size={18} /> Seller dashboard</Link>
        <div className="mt-4">
          <PageHeader eyebrow="Your shop" title="Orders" description="Confirm new orders quickly. Buyers see each status change, and delivered orders count as paid." />
        </div>

        <div className="mb-5 flex gap-2">
          {TABS.map((item) => (
            <button key={item.key} type="button" onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm font-bold ${tab.key === item.key ? "bg-loco-wine text-white" : "bg-white text-loco-ink hover:bg-loco-cream"}`}>
              {item.label} ({(data?.orders || []).filter((order) => item.statuses.includes(order.status)).length})
            </button>
          ))}
        </div>

        {error && <Message className="mb-4">{error}</Message>}

        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No orders here" description={tab.key === "active" ? "New orders from buyers will appear here." : "Nothing in this list yet."} />
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => {
              const status = ORDER_STATUS[order.status];
              return (
                <li key={order.id}>
                  <Link to={`/orders/${order.id}`} className="block rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:border-loco-orange">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{order.reference}</p>
                        <p className="mt-1 font-black text-loco-ink">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.deliveryDistrict} · {order.deliveryAddress}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <div className="text-right">
                        <Badge tone={status.tone}>{status.label}</Badge>
                        <p className="mt-2 text-lg font-black text-loco-wine">{formatRWF(order.total)}</p>
                        <p className="text-xs text-gray-500">{PAYMENT_PROVIDERS[order.payment?.provider]}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">{order.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </main>
  );
}
