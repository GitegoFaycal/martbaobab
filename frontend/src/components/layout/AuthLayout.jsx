import {
  BadgeCheck,
  ShoppingBag,
  ShoppingCart,
  Sprout,
  Truck,
} from "lucide-react";
import { Link, Outlet } from "react-router-dom";

const features = [
  {
    icon: ShoppingBag,
    text: "Discover local shops, products and services",
  },
  {
    icon: BadgeCheck,
    text: "Connect with verified sellers and providers",
  },
  {
    icon: Truck,
    text: "Order and receive convenient local delivery",
  },
];

export default function AuthLayout() {
  return (
    <main className="min-h-screen bg-baobab-cream lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-baobab-wine p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-36 -top-36 h-96 w-96 rounded-full bg-baobab-orange/30" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-baobab-mint/20" />

        <Link to="/" className="relative flex items-center gap-3">
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-white text-baobab-wine">
            <ShoppingCart size={26} />
            <Sprout
              size={17}
              className="absolute -right-1 -top-1 text-baobab-mint"
            />
          </span>

          <span>
            <strong className="block text-2xl">MartBaobab</strong>
            <small className="text-baobab-mint">
              Shop · Deliver · Connect · Earn
            </small>
          </span>
        </Link>

        <div className="relative max-w-xl">
          <p className="font-semibold text-baobab-mint">
            Rwanda&apos;s local marketplace
          </p>

          <h1 className="mt-4 text-5xl font-black leading-tight">
            Create an account and connect with local opportunities.
          </h1>

          <p className="mt-5 text-lg text-white/75">
            Shop locally, discover trusted services, grow a business and manage
            orders from one connected platform.
          </p>

          <div className="mt-10 space-y-5">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-baobab-orange">
                  <Icon size={22} />
                </span>

                <span className="font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-white/50">
          © 2026 MartBaobab
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-lg">
          <Link
            to="/"
            className="mb-8 flex items-center justify-center gap-2 lg:hidden"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-baobab-wine text-white">
              <ShoppingCart size={21} />
            </span>

            <strong className="text-xl text-baobab-wine">
              MartBaobab
            </strong>
          </Link>

          <Outlet />
        </div>
      </section>
    </main>
  );
}