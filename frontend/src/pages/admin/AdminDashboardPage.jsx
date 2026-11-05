import {
  BadgeCheck,
  Briefcase,
  Package,
  Recycle,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/api";
import {
  Badge,
  Button,
  Container,
  Message,
  PageHeader,
  Spinner,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { formatDate, formatRWF, titleCase } from "../../lib/format";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const stats = useFetch("/admin/stats");
  const shops = useFetch("/admin/shops");
  const users = useFetch("/admin/users");
  const [tab, setTab] = useState("shops");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function verifyShop(shop) {
    setBusy(shop.id);
    setError("");
    try {
      await apiRequest(`/admin/shops/${shop.id}/verify`, { method: "PATCH", body: { verified: !shop.verified } });
      shops.refetch();
      stats.refetch();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  }

  async function toggleUser(target) {
    setBusy(target.id);
    setError("");
    try {
      await apiRequest(`/admin/users/${target.id}/active`, { method: "PATCH", body: { active: !target.active } });
      users.refetch();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  }

  const s = stats.data?.stats;

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <PageHeader eyebrow="Administration" title={`Welcome, ${user.name.split(" ")[0]}`} description="Verify shops, keep the marketplace safe and watch LOCO grow." />

        {error && <Message className="mb-4">{error}</Message>}

        {stats.loading ? (
          <Spinner />
        ) : s ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Users} label="Users" value={s.users} sub={`${s.sellers} sellers`} />
            <Stat icon={Store} label="Shops" value={s.shops} sub={`${s.unverifiedShops} waiting for verification`} />
            <Stat icon={Package} label="Active listings" value={s.listings} sub={`${s.secondHand} second-hand`} />
            <Stat icon={Briefcase} label="Open jobs" value={s.openJobs} sub={`${s.applications} applications`} />
            <Stat icon={ShoppingBag} label="Orders" value={s.orders} sub={`${formatRWF(s.revenue)} delivered`} />
            <Stat icon={Recycle} label="Second-hand share" value={s.listings ? `${Math.round((s.secondHand / s.listings) * 100)}%` : "0%"} sub="of active listings" />
          </div>
        ) : null}

        <div className="mt-8 flex gap-2">
          {[["shops", "Shops"], ["users", "Users"]].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === key ? "bg-loco-wine text-white" : "bg-white hover:bg-loco-cream"}`}>{label}</button>
          ))}
        </div>

        <section className="mt-4 overflow-hidden rounded-2xl border border-orange-100 bg-white">
          {tab === "shops" ? (
            shops.loading ? <Spinner /> : (
              <table className="w-full text-sm">
                <thead className="bg-loco-cream text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr><th className="px-4 py-3">Shop</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">District</th><th className="px-4 py-3">Listings</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {(shops.data?.shops || []).map((shop) => (
                    <tr key={shop.id}>
                      <td className="px-4 py-3"><Link to={`/shops/${shop.slug}`} className="font-bold text-loco-wine hover:underline">{shop.name}</Link><div className="text-xs text-gray-400">{formatDate(shop.createdAt)}</div></td>
                      <td className="px-4 py-3">{shop.owner.name}<div className="text-xs text-gray-400">{shop.owner.email}</div></td>
                      <td className="px-4 py-3">{shop.district}</td>
                      <td className="px-4 py-3">{shop._count.listings} · {shop._count.orders} orders</td>
                      <td className="px-4 py-3">{shop.verified ? <Badge tone="green"><BadgeCheck size={12} /> Verified</Badge> : <Badge tone="amber">Pending</Badge>}</td>
                      <td className="px-4 py-3 text-right"><Button size="sm" variant={shop.verified ? "ghost" : "mint"} loading={busy === shop.id} onClick={() => verifyShop(shop)}>{shop.verified ? "Unverify" : "Verify"}</Button></td>
                    </tr>
                  ))}
                  {shops.data?.shops?.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No shops yet.</td></tr>}
                </tbody>
              </table>
            )
          ) : users.loading ? <Spinner /> : (
            <table className="w-full text-sm">
              <thead className="bg-loco-cream text-left text-xs uppercase tracking-wide text-gray-500">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">District</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {(users.data?.users || []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-bold">{item.name}<div className="text-xs font-normal text-gray-400">{formatDate(item.createdAt)}</div></td>
                    <td className="px-4 py-3">{item.email}<div className="text-xs text-gray-400">{item.phone}</div></td>
                    <td className="px-4 py-3"><Badge tone={item.role === "ADMIN" ? "red" : item.role === "SELLER" ? "blue" : "mint"}>{titleCase(item.role)}</Badge></td>
                    <td className="px-4 py-3">{item.district || "–"}</td>
                    <td className="px-4 py-3">{item.active ? <Badge tone="green">Active</Badge> : <Badge tone="red">Disabled</Badge>}</td>
                    <td className="px-4 py-3 text-right">{item.id !== user.id && <Button size="sm" variant={item.active ? "ghost" : "mint"} className={item.active ? "text-red-600" : ""} loading={busy === item.id} onClick={() => toggleUser(item)}>{item.active ? "Disable" : "Enable"}</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </Container>
    </main>
  );
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-loco-mint/20 text-loco-wine"><Icon size={22} /></span>
      <strong className="mt-4 block text-2xl font-black text-loco-wine">{value}</strong>
      <p className="text-sm font-semibold text-loco-ink">{label}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}
