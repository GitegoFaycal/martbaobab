import {
  ChevronDown,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Sprout,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const publicLinks = [
  {
    label: "Shops",
    path: "/shops",
  },
  {
    label: "Services",
    path: "/services",
  },
  {
    label: "Tasks",
    path: "/tasks",
  },
];

export default function Header() {
  const { user, isAuthenticated, authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
      setAccountOpen(false);
      setMobileOpen(false);
      navigate("/", {
        replace: true,
      });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-3">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-baobab-wine text-white">
            <ShoppingCart size={22} />

            <Sprout
              size={15}
              className="absolute -right-1 -top-1 text-baobab-mint"
            />
          </span>

          <span>
            <strong className="block text-xl leading-5 text-baobab-wine">
              MartBaobab
            </strong>

            <small className="tracking-wide text-baobab-orange">
              Shop · Connect · Earn
            </small>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {publicLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-semibold ${
                  isActive
                    ? "text-baobab-orange"
                    : "text-baobab-ink hover:text-baobab-wine"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {!isAuthenticated && (
            <NavLink
              to="/register?role=SELLER"
              className="text-sm font-semibold text-baobab-ink hover:text-baobab-wine"
            >
              Become a seller
            </NavLink>
          )}

          {user?.role === "SELLER" && (
            <NavLink
              to="/seller"
              className="text-sm font-semibold text-baobab-wine"
            >
              Seller dashboard
            </NavLink>
          )}

          {user?.role === "ADMIN" && (
            <NavLink
              to="/admin"
              className="text-sm font-semibold text-baobab-wine"
            >
              Administration
            </NavLink>
          )}
        </nav>

        {!authLoading && !isAuthenticated && (
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/login"
              className="rounded-full border border-baobab-wine px-5 py-2 text-sm font-bold text-baobab-wine hover:bg-baobab-cream"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="rounded-full bg-baobab-wine px-5 py-2 text-sm font-bold text-white hover:bg-baobab-wine-dark"
            >
              Sign up
            </Link>
          </div>
        )}

        {!authLoading && isAuthenticated && (
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setAccountOpen((current) => !current)}
              className="flex items-center gap-3 rounded-full border border-orange-100 bg-white py-1.5 pl-1.5 pr-3 shadow-sm hover:border-baobab-orange"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-baobab-mint font-bold text-baobab-wine">
                {user.name.charAt(0).toUpperCase()}
              </span>

              <span className="hidden text-left md:block">
                <strong className="block max-w-28 truncate text-sm">
                  {user.name}
                </strong>

                <small className="block text-xs text-gray-500">
                  {formatRole(user.role)}
                </small>
              </span>

              <ChevronDown size={16} />
            </button>

            {accountOpen && (
              <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-orange-100 bg-white p-2 shadow-xl">
                <div className="border-b border-gray-100 px-3 py-3">
                  <p className="truncate font-bold text-baobab-wine">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setAccountOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-baobab-cream"
                >
                  <UserRound size={18} />
                  My profile
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-baobab-cream"
                >
                  <Package size={18} />
                  My orders
                </Link>

                {user.role === "SELLER" && (
                  <Link
                    to="/seller"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-baobab-cream"
                  >
                    <Store size={18} />
                    Seller dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut size={18} />
                  {loggingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="ml-auto rounded-lg p-2 lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-orange-100 bg-white px-4 py-5 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-baobab-cream"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold hover:bg-baobab-cream"
                >
                  My profile
                </Link>

                {user.role === "SELLER" && (
                  <Link
                    to="/seller"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-3 font-semibold hover:bg-baobab-cream"
                  >
                    Seller dashboard
                  </Link>
                )}

                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-3 font-semibold hover:bg-baobab-cream"
                  >
                    Administration
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl px-4 py-3 text-left font-semibold text-red-600 hover:bg-red-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-baobab-wine px-4 py-3 text-center font-bold text-baobab-wine"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-baobab-wine px-4 py-3 text-center font-bold text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function formatRole(role) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}