import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button, Container, EmptyState, Message, PageHeader, Spinner } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useI18n } from "../../i18n";
import { formatDate, formatRWF, orderStatus, paymentLabel } from "../../lib/format";

export default function OrdersPage() {
  const { t, lang } = useI18n();
  const { data, loading, error } = useFetch("/orders/mine");
  const orders = data?.orders || [];

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <PageHeader eyebrow={t("orders.eyebrow")} title={t("orders.title")} description={t("orders.text")} />
        {error && <Message className="mb-4">{error}</Message>}

        {loading ? (
          <Spinner label={t("common.loading")} />
        ) : orders.length === 0 ? (
          <EmptyState icon={Package} title={t("orders.none")} description={t("orders.noneText")} action={<Button as={Link} to="/shop" variant="orange">{t("orders.shopNearby")}</Button>} />
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => {
              const status = orderStatus(order.status, t);
              return (
                <li key={order.id}>
                  <Link to={`/orders/${order.id}`} className="block rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:border-loco-orange">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{order.reference}</p>
                        <p className="mt-1 font-black text-loco-wine">{order.shop.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }, lang)}</p>
                      </div>
                      <div className="text-right">
                        <Badge tone={status.tone}>{status.label}</Badge>
                        <p className="mt-2 text-lg font-black text-loco-ink">{formatRWF(order.total)}</p>
                        <p className="text-xs text-gray-500">{paymentLabel(order.payment?.provider, t)}</p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-1 text-sm text-gray-600">{order.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}</p>
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
