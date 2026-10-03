import {
  BarChart3,
  Package,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const statistics = [
  {
    label: "Products",
    value: "0",
    icon: Package,
  },
  {
    label: "Orders",
    value: "0",
    icon: ShoppingBag,
  },
  {
    label: "Shop views",
    value: "0",
    icon: BarChart3,
  },
];

export default function SellerDashboardPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-[75vh] bg-baobab-cream px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <p className="font-bold text-baobab-orange">
          Seller dashboard
        </p>

        <h1 className="mt-2 text-4xl font-black text-baobab-wine">
          Welcome, {user.name}
        </h1>

        <p className="mt-3 max-w-2xl text-gray-600">
          This is the starting point for shop registration, product
          management, service management and seller analytics.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {statistics.map(({ label, value, icon: Icon }) => (
            <article
              key={label}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-baobab-mint/20 text-baobab-wine">
                <Icon />
              </span>

              <strong className="mt-5 block text-3xl text-baobab-wine">
                {value}
              </strong>

              <p className="mt-1 text-gray-500">{label}</p>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-3xl bg-baobab-wine p-8 text-white">
          <Store size={35} className="text-baobab-mint" />

          <h2 className="mt-5 text-2xl font-black">
            Create your MartBaobab shop
          </h2>

          <p className="mt-2 max-w-xl text-white/70">
            Shop registration and management will be developed during
            Sprint 3 and Sprint 4.
          </p>

          <button
            type="button"
            className="mt-6 rounded-full bg-baobab-orange px-6 py-3 font-bold"
          >
            Create shop
          </button>
        </section>
      </div>
    </main>
  );
}