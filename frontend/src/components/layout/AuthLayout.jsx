import { Briefcase, Recycle, ShoppingBag, Truck } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import Logo from "../Logo";

const features = [
  { icon: ShoppingBag, text: "Buy everyday goods from the shop next door" },
  { icon: Recycle, text: "Find second-hand deals at lower prices" },
  { icon: Briefcase, text: "Get hired for daily and contract work nearby" },
  { icon: Truck, text: "Moto delivery and MoMo payment, the local way" },
];

export default function AuthLayout() {
  return (
    <main className="min-h-screen bg-loco-cream lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-loco-wine p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-36 -top-36 h-96 w-96 rounded-full bg-loco-orange/30" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-loco-mint/20" />

        <div className="relative"><Logo light /></div>

        <div className="relative max-w-xl">
          <p className="font-semibold text-loco-mint">Local Connect · Rwanda</p>
          <h1 className="mt-4 text-5xl font-black leading-tight">Everything in your district, one app.</h1>
          <p className="mt-5 text-lg text-white/75">Shops, second-hand deals, local jobs and services across all 30 districts.</p>
          <div className="mt-10 space-y-5">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-loco-orange"><Icon size={22} /></span>
                <span className="font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-white/50">© {new Date().getFullYear()} LOCO</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-lg">
          <div className="mb-8 flex justify-center lg:hidden"><Logo /></div>
          <Outlet />
          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/" className="font-bold text-loco-wine hover:text-loco-orange">Back to LOCO</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
