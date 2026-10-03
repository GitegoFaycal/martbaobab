import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function getDashboardPath(user) {
  if (user.role === "ADMIN") {
    return "/admin";
  }

  if (user.role === "SELLER") {
    return "/seller";
  }

  return "/profile";
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const requestedPath = location.state?.from?.pathname;
      const destination =
        requestedPath || getDashboardPath(response.user);

      navigate(destination, {
        replace: true,
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          "Login failed. Check your email address and password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-orange-100/70 sm:p-9">
      <div>
        <p className="font-bold text-baobab-orange">Welcome back</p>

        <h1 className="mt-2 text-3xl font-black text-baobab-wine">
          Log in to MartBaobab
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Access your account, orders, shop and marketplace activity.
        </p>
      </div>

      {location.state?.message && !error && (
        <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          {location.state.message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-bold text-baobab-ink"
          >
            Email address
          </label>

          <div className="flex items-center rounded-xl border border-gray-200 bg-white px-4 focus-within:border-baobab-orange focus-within:ring-4 focus-within:ring-orange-100">
            <Mail size={19} className="text-gray-400" />

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full bg-transparent px-3 py-3.5 outline-none"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-bold text-baobab-ink"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-bold text-baobab-wine hover:text-baobab-orange"
            >
              Forgot password?
            </Link>
          </div>

          <div className="flex items-center rounded-xl border border-gray-200 bg-white px-4 focus-within:border-baobab-orange focus-within:ring-4 focus-within:ring-orange-100">
            <LockKeyhole size={19} className="text-gray-400" />

            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full bg-transparent px-3 py-3.5 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="text-gray-400 hover:text-baobab-wine"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-baobab-wine px-5 py-3.5 font-bold text-white hover:bg-baobab-wine-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <LoaderCircle size={19} className="animate-spin" />}
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-gray-500">
        Do not have a MartBaobab account?{" "}
        <Link
          to="/register"
          className="font-bold text-baobab-wine hover:text-baobab-orange"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}