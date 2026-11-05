import { CheckCircle2, Eye, EyeOff, Store, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fieldErrorsFrom } from "../../api/api";
import { Button, DistrictSelect, Field, Input, Message } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useT } from "../../i18n";
import { saveDistrict } from "../../lib/rwanda";

export default function RegisterPage() {
  const t = useT();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState(() => ({
    role: searchParams.get("role") === "SELLER" ? "SELLER" : "CUSTOMER",
    name: "",
    email: "",
    phone: "",
    district: "",
    password: "",
    confirmPassword: "",
  }));
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    if (error) setError("");
  }

  function validateForm() {
    const errors = {};
    if (form.name.trim().length < 2) errors.name = t("auth.fullName");
    if (!form.email.includes("@")) errors.email = t("auth.email");
    if (!/^(\+?250|0)?7[2389]\d{7}$/.test(form.phone.replace(/[\s()-]/g, ""))) errors.phone = "078 123 4567";
    if (!form.district) errors.district = t("common.chooseDistrict");
    if (form.password.length < 8) errors.password = t("auth.check8");
    else if (!/[A-Z]/.test(form.password)) errors.password = t("auth.checkUpper");
    else if (!/[a-z]/.test(form.password)) errors.password = t("auth.checkLower");
    else if (!/[0-9]/.test(form.password)) errors.password = t("auth.checkNumber");
    if (form.password !== form.confirmPassword) errors.confirmPassword = t("auth.confirmPassword");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        district: form.district,
        password: form.password,
        role: form.role,
      });
      saveDistrict(form.district);
      navigate(response.user.role === "SELLER" ? "/seller" : "/", { replace: true });
    } catch (requestError) {
      setFieldErrors((current) => ({ ...current, ...fieldErrorsFrom(requestError) }));
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  const checks = [
    { text: t("auth.check8"), valid: form.password.length >= 8 },
    { text: t("auth.checkUpper"), valid: /[A-Z]/.test(form.password) },
    { text: t("auth.checkLower"), valid: /[a-z]/.test(form.password) },
    { text: t("auth.checkNumber"), valid: /[0-9]/.test(form.password) },
  ];

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-orange-100/70 sm:p-9">
      <p className="font-bold text-loco-orange">{t("auth.join")}</p>
      <h1 className="mt-2 text-3xl font-black text-loco-wine">{t("auth.registerTitle")}</h1>
      <p className="mt-2 text-sm leading-6 text-gray-500">{t("auth.registerText")}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          { key: "CUSTOMER", icon: UserRound, label: t("auth.buyerWorker"), text: t("auth.buyerWorkerText") },
          { key: "SELLER", icon: Store, label: t("auth.seller"), text: t("auth.sellerText") },
        ].map(({ key, icon: Icon, label, text }) => (
          <button key={key} type="button" onClick={() => setForm((c) => ({ ...c, role: key }))} aria-pressed={form.role === key} className={`rounded-2xl border p-4 text-left ${form.role === key ? "border-loco-orange bg-orange-50 ring-2 ring-orange-100" : "border-gray-200 hover:border-loco-orange"}`}>
            <Icon size={22} className={form.role === key ? "text-loco-orange" : "text-gray-400"} />
            <strong className="mt-2 block text-sm text-loco-ink">{label}</strong>
            <span className="text-xs text-gray-500">{text}</span>
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs text-gray-500">{t("auth.everyoneCan")}</p>

      {error && <Message className="mt-5">{error}</Message>}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Field label={form.role === "SELLER" ? t("auth.ownerName") : t("auth.fullName")} htmlFor="name" error={fieldErrors.name}>
          <Input id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} placeholder={t("auth.namePh")} error={fieldErrors.name} />
        </Field>
        <Field label={t("auth.email")} htmlFor="email" error={fieldErrors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com" error={fieldErrors.email} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("auth.phone")} htmlFor="phone" error={fieldErrors.phone}>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} placeholder="078 123 4567" error={fieldErrors.phone} />
          </Field>
          <Field label={t("auth.district")} htmlFor="district" error={fieldErrors.district}>
            <DistrictSelect id="district" name="district" value={form.district} onChange={handleChange} error={fieldErrors.district} placeholder={t("common.chooseDistrict")} />
          </Field>
        </div>

        <Field label={t("auth.password")} htmlFor="password" error={fieldErrors.password}>
          <div className="relative">
            <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={handleChange} placeholder={t("auth.createPassword")} error={fieldErrors.password} className="pr-12" />
            <button type="button" onClick={() => setShowPassword((c) => !c)} aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-loco-wine">
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {checks.map((check) => (
              <span key={check.text} className={`flex items-center gap-1.5 text-xs ${check.valid ? "text-green-700" : "text-gray-400"}`}><CheckCircle2 size={13} /> {check.text}</span>
            ))}
          </div>
        </Field>

        <Field label={t("auth.confirmPassword")} htmlFor="confirmPassword" error={fieldErrors.confirmPassword}>
          <Input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} placeholder={t("auth.confirmPh")} error={fieldErrors.confirmPassword} />
        </Field>

        <label className="flex items-start gap-3 text-sm leading-6 text-gray-600">
          <input type="checkbox" required className="mt-1 h-4 w-4 accent-loco-wine" />
          <span>{t("auth.agree")}</span>
        </label>

        <Button type="submit" className="w-full" loading={submitting}>
          {submitting ? t("auth.creating") : form.role === "SELLER" ? t("auth.createSeller") : t("auth.create")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t("auth.haveAccount")} <Link to="/login" className="font-bold text-loco-wine hover:text-loco-orange">{t("auth.login")}</Link>
      </p>
    </div>
  );
}
