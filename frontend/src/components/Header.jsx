import {
  Briefcase,
  ChevronDown,
  ClipboardList,
  LogOut,
  Menu,
  Package,
  Recycle,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useT } from "../i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

function navClass({ isActive }) {
  return `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${
    isActive
      ? "bg-loco-cream text-loco-wine"
      : "text-loco-ink hover:bg-loco-cream hover:text-loco-wine"
  }`;
}

function Avatar({ user, size = "h-8 w-8" }) {
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt="" className={`${size} rounded-full object-cover`} />
  ) : (
    <span className={`grid ${size} place-items-center rounded-full bg-loco-mint font-bold text-loco-wine`}>
      {user.name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function Header() {
  const t = useT();
  const { user, isAuthenticated, authLoading, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const accountMenuRef = useRef(null);

  const sections = [
    { label: t("nav.people"), path: "/people", icon: Users },
    { label: t("nav.shop"), path: "/shop", icon: ShoppingBag },
    { label: t("nav.secondHand"), path: "/second-hand", icon: Recycle },
    { label: t("nav.services"), path: "/services", icon: Wrench },
    { label: t("nav.jobs"), path: "/jobs", icon: Briefcase },
  ];

  useEffect(() => {
    if (!accountOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountOpen]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
      setAccountOpen(false);
      setMobileOpen(false);
      navigate("/", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  const accountLinks = [
    { label: t("nav.myProfile"), to: "/profile", icon: UserRound },
    { label: t("nav.myOrders"), to: "/orders", icon: Package },
    { label: t("nav.myApplications"), to: "/applications", icon: ClipboardList },
    { label: t("nav.hiring"), to: "/hiring", icon: Briefcase },
    ...(user?.role === "SELLER" || user?.role === "ADMIN"
      ? [{ label: t("nav.sellerDashboard"), to: "/seller", icon: Store }]
      : []),
    ...(user?.role === "ADMIN" ? [{ label: t("nav.admin"), to: "/admin", icon: ShieldCheck }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Logo onClick={() => setMobileOpen(false)} />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {sections.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} className={navClass}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher className="hidden md:inline-flex" />

          <Link
            to="/jobs/new"
            className="hidden rounded-full border border-loco-mint px-4 py-2 text-sm font-bold text-loco-wine hover:bg-loco-mint/10 md:inline-flex"
          >
            {t("nav.postJob")}
          </Link>

          <Link
            to="/cart"
            aria-label={`${t("nav.cart")}, ${count}`}
            className="relative grid h-10 w-10 place-items-center rounded-full text-loco-wine hover:bg-loco-cream"
          >
            <ShoppingCart size={21} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-loco-orange px-1 text-[11px] font-black text-white">
                {count}
              </span>
            )}
          </Link>

          {!authLoading && !isAuthenticated && (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="rounded-full border border-loco-wine px-4 py-2 text-sm font-bold text-loco-wine hover:bg-loco-cream">
                {t("nav.login")}
              </Link>
              <Link to="/register" className="rounded-full bg-loco-wine px-4 py-2 text-sm font-bold text-white hover:bg-loco-wine-dark">
                {t("nav.signup")}
              </Link>
            </div>
          )}

          {!authLoading && isAuthenticated && (
            <div ref={accountMenuRef} className="relative hidden sm:block">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((current) => !current)}
                className="flex items-center gap-2 rounded-full border border-orange-100 bg-white py-1 pl-1 pr-3 shadow-sm hover:border-loco-orange"
              >
                <Avatar user={user} />
                <span className="hidden max-w-28 truncate text-left text-sm font-bold md:block">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown size={15} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-orange-100 bg-white p-2 shadow-xl">
                  <div className="border-b border-gray-100 px-3 py-3">
                    <p className="truncate font-bold text-loco-wine">{user.name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {user.email}
                      {user.district ? ` · ${user.district}` : ""}
                    </p>
                  </div>

                  <div className="mt-1">
                    {accountLinks.map(({ label, to, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-loco-cream"
                      >
                        <Icon size={17} />
                        {label}
                      </Link>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <LogOut size={17} />
                    {loggingOut ? t("nav.loggingOut") : t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="rounded-lg p-2 text-loco-wine lg:hidden"
            aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-orange-100 bg-white px-4 py-4 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1">
            <div className="mb-2 flex justify-end md:hidden">
              <LanguageSwitcher />
            </div>

            {sections.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold hover:bg-loco-cream"
              >
                <Icon size={18} className="text-loco-orange" />
                {label}
              </Link>
            ))}

            <Link
              to="/jobs/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold hover:bg-loco-cream"
            >
              <Briefcase size={18} className="text-loco-mint-dark" />
              {t("nav.postJob")}
            </Link>

            <hr className="my-2 border-orange-100" />

            {isAuthenticated ? (
              <>
                {accountLinks.map(({ label, to, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold hover:bg-loco-cream"
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut size={18} />
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-xl border border-loco-wine px-4 py-3 text-center font-bold text-loco-wine">
                  {t("nav.login")}
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="rounded-xl bg-loco-wine px-4 py-3 text-center font-bold text-white">
                  {t("nav.signup")}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
