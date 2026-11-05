import { Link } from "react-router-dom";
import { useT } from "../i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

export default function Footer() {
  const t = useT();

  const columns = [
    {
      title: t("footer.buy"),
      links: [
        { label: t("nav.people"), to: "/people" },
        { label: t("nav.shop"), to: "/shop" },
        { label: t("home.secondHandDeals"), to: "/second-hand" },
        { label: t("home.localServices"), to: "/services" },
        { label: t("footer.shops"), to: "/shops" },
      ],
    },
    {
      title: t("footer.work"),
      links: [
        { label: t("footer.findJobs"), to: "/jobs" },
        { label: t("nav.postJob"), to: "/jobs/new" },
        { label: t("nav.myApplications"), to: "/applications" },
        { label: t("nav.hiring"), to: "/hiring" },
      ],
    },
    {
      title: t("footer.sell"),
      links: [
        { label: t("home.becomeSeller"), to: "/register?role=SELLER" },
        { label: t("nav.sellerDashboard"), to: "/seller" },
        { label: t("nav.myProfile"), to: "/profile" },
      ],
    },
  ];

  return (
    <footer className="border-t border-orange-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">{t("footer.tagline")}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-loco-orange">{t("footer.pay")}</p>
          <div className="mt-4"><LanguageSwitcher /></div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="font-black text-loco-wine">{column.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-600 hover:text-loco-wine">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-orange-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {t("footer.rights")}</p>
          <p>{t("footer.motto")}</p>
        </div>
      </div>
    </footer>
  );
}
