import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Container,
  EmptyState,
  Message,
  PageHeader,
  Spinner,
} from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { formatDate, formatRWF, ORDER_STATUS, PAYMENT_PROVIDERS } from "../../lib/format";

export default function OrdersPage() {
  const { data, loading, error } = useFetch("/orders/mine");
  const orders = data?.orders || [];

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <PageHeader eyebrow="Your purchases" title="My orders" description="Everything you have ordered from LOCO shops." />

        {error && <Message className="mb-4">{error}</Message>}

        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <EmptyState icon={Package} title="No orders yet" description="When you order from a shop, it will appear here." action={<Button as={Link} to="/shop" variant="orange">Shop nearby</Button>} />
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => {
              const status = ORDER_STATUS[order.status];
              return (
                <li key={order.id}>
                  <Link to={`/orders/${order.id}`} className="block rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:border-loco-orange">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{order.reference}</p>
                        <p className="mt-1 font-black text-loco-wine">{order.shop.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <div className="text-right">
                        <Badge tone={status.tone}>{status.label}</Badge>
                        <p className="mt-2 text-lg font-black text-loco-ink">{formatRWF(order.total)}</p>
                        <p className="text-xs text-gray-500">{PAYMENT_PROVIDERS[order.payment?.provider]}</p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-1 text-sm text-gray-600">
                      {order.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}
                    </p>
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
