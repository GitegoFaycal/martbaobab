import { Link } from "react-router-dom";
import Logo from "./Logo";

const columns = [
  {
    title: "Buy",
    links: [
      { label: "Shop nearby", to: "/shop" },
      { label: "Second-hand deals", to: "/second-hand" },
      { label: "Local services", to: "/services" },
      { label: "Shops", to: "/shops" },
    ],
  },
  {
    title: "Work",
    links: [
      { label: "Find local jobs", to: "/jobs" },
      { label: "Post a job", to: "/jobs/new" },
      { label: "My applications", to: "/applications" },
      { label: "People I'm hiring", to: "/hiring" },
    ],
  },
  {
    title: "Sell",
    links: [
      { label: "Become a seller", to: "/register?role=SELLER" },
      { label: "Seller dashboard", to: "/seller" },
      { label: "My orders", to: "/orders" },
      { label: "My profile", to: "/profile" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-orange-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">
            LOCO connects buyers, sellers, workers and employers in every
            district of Rwanda. Shop from the kiosk next door, find a good
            second-hand deal, or get hired for local work.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-loco-orange">
            Pay with MTN MoMo · Airtel Money · Cash on delivery
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="font-black text-loco-wine">{column.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-600 hover:text-loco-wine"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-orange-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LOCO · Local Connect, Kigali, Rwanda.</p>
          <p>Turi kumwe. Shop local, hire local, grow local.</p>
        </div>
      </div>
    </footer>
  );
}
