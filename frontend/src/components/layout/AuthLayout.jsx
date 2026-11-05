import { Briefcase, Recycle, ShoppingBag, Truck } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { useT } from "../../i18n";
import LanguageSwitcher from "../LanguageSwitcher";
import Logo from "../Logo";

export default function AuthLayout() {
  const t = useT();
  const features = [
    { icon: ShoppingBag, text: t("auth.side1") },
    { icon: Recycle, text: t("auth.side2") },
    { icon: Briefcase, text: t("auth.side3") },
    { icon: Truck, text: t("auth.side4") },
  ];

  return (
    <main className="min-h-screen bg-loco-cream lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-loco-wine p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-36 -top-36 h-96 w-96 rounded-full bg-loco-orange/30" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-loco-mint/20" />

        <div className="relative flex items-center justify-between">
          <Logo light />
          <LanguageSwitcher light />
        </div>

        <div className="relative max-w-xl">
          <p className="font-semibold text-loco-mint">Local Connect · Rwanda</p>
          <h1 className="mt-4 text-5xl font-black leading-tight">{t("auth.sideTitle")}</h1>
          <p className="mt-5 text-lg text-white/75">{t("auth.sideText")}</p>
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
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
            <LanguageSwitcher />
          </div>
          <div className="mb-4 hidden justify-end lg:flex"><LanguageSwitcher /></div>
          <Outlet />
          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/" className="font-bold text-loco-wine hover:text-loco-orange">{t("auth.backTo")}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
