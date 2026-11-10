import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Field, Input, Message } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useT } from "../../i18n";

function getDashboardPath(user) {
  if (user.role === "ADMIN") return "/admin";
  if (user.role === "SELLER") return "/seller";
  return "/";
}

export default function LoginPage() {
  const t = useT();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await login({ email: form.email.trim().toLowerCase(), password: form.password });
      const requestedPath = location.state?.from?.pathname;
      navigate(requestedPath || getDashboardPath(response.user), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-blue-100/70 sm:p-9">
      <p className="font-bold text-loco-blue">{t("auth.welcomeBack")}</p>
      <h1 className="mt-2 text-3xl font-black text-loco-navy">{t("auth.loginTitle")}</h1>
      <p className="mt-2 text-sm leading-6 text-gray-500">{t("auth.loginText")}</p>

      {location.state?.message && !error && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{location.state.message}</div>
      )}

      {error && <Message className="mt-6">{error}</Message>}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <Field label={t("auth.email")} htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
        </Field>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-bold text-loco-ink">{t("auth.password")}</label>
            <Link to="/forgot-password" className="text-sm font-bold text-loco-navy hover:text-loco-blue">{t("auth.forgot")}</Link>
          </div>
          <div className="relative">
            <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={handleChange} required className="pr-12" />
            <button type="button" onClick={() => setShowPassword((c) => !c)} aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-loco-navy">
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" loading={submitting}>{submitting ? t("auth.loggingIn") : t("auth.login")}</Button>
      </form>

      <p className="mt-7 text-center text-sm text-gray-500">
        {t("auth.noAccount")} <Link to="/register" className="font-bold text-loco-navy hover:text-loco-blue">{t("auth.createAccount")}</Link>
      </p>
    </div>
  );
}
