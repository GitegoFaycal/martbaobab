import { CheckCircle2, Eye, EyeOff, Store, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fieldErrorsFrom } from "../../api/api";
import {
  Button,
  DistrictSelect,
  Field,
  Input,
  Message,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { saveDistrict } from "../../lib/rwanda";

export default function RegisterPage() {
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
    if (form.name.trim().length < 2) errors.name = "Enter your full name";
    if (!form.email.includes("@")) errors.email = "Enter a valid email address";
    if (!/^(\+?250|0)?7[2389]\d{7}$/.test(form.phone.replace(/[\s()-]/g, ""))) errors.phone = "Enter a valid Rwandan number, e.g. 078 123 4567";
    if (!form.district) errors.district = "Choose your district";
    if (form.password.length < 8) errors.password = "Password must contain at least 8 characters";
    else if (!/[A-Z]/.test(form.password)) errors.password = "Add at least one uppercase letter";
    else if (!/[a-z]/.test(form.password)) errors.password = "Add at least one lowercase letter";
    else if (!/[0-9]/.test(form.password)) errors.password = "Add at least one number";
    if (form.password !== form.confirmPassword) errors.confirmPassword = "The passwords do not match";
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
      setError(requestError.message || "Account creation failed. Please check your information.");
    } finally {
      setSubmitting(false);
    }
  }

  const checks = [
    { text: "At least 8 characters", valid: form.password.length >= 8 },
    { text: "One uppercase letter", valid: /[A-Z]/.test(form.password) },
    { text: "One lowercase letter", valid: /[a-z]/.test(form.password) },
    { text: "One number", valid: /[0-9]/.test(form.password) },
  ];

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-orange-100/70 sm:p-9">
      <p className="font-bold text-loco-orange">Join LOCO</p>
      <h1 className="mt-2 text-3xl font-black text-loco-wine">Create your account</h1>
      <p className="mt-2 text-sm leading-6 text-gray-500">Buy, sell, hire and get hired in your district. Free for everyone.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          { key: "CUSTOMER", icon: UserRound, label: "Buyer / worker", text: "Shop, order, find jobs" },
          { key: "SELLER", icon: Store, label: "Seller", text: "Open a shop and sell" },
        ].map(({ key, icon: Icon, label, text }) => (
          <button key={key} type="button" onClick={() => setForm((c) => ({ ...c, role: key }))} aria-pressed={form.role === key} className={`rounded-2xl border p-4 text-left ${form.role === key ? "border-loco-orange bg-orange-50 ring-2 ring-orange-100" : "border-gray-200 hover:border-loco-orange"}`}>
            <Icon size={22} className={form.role === key ? "text-loco-orange" : "text-gray-400"} />
            <strong className="mt-2 block text-sm text-loco-ink">{label}</strong>
            <span className="text-xs text-gray-500">{text}</span>
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs text-gray-500">Everyone can post jobs and apply for work, whichever you choose.</p>

      {error && <Message className="mt-5">{error}</Message>}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Field label={form.role === "SELLER" ? "Your name (shop owner)" : "Full name"} htmlFor="name" error={fieldErrors.name}>
          <Input id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} placeholder="Enter your name" error={fieldErrors.name} />
        </Field>
        <Field label="Email address" htmlFor="email" error={fieldErrors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com" error={fieldErrors.email} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telephone (MTN or Airtel)" htmlFor="phone" error={fieldErrors.phone}>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} placeholder="078 123 4567" error={fieldErrors.phone} />
          </Field>
          <Field label="District" htmlFor="district" error={fieldErrors.district}>
            <DistrictSelect id="district" name="district" value={form.district} onChange={handleChange} error={fieldErrors.district} />
          </Field>
        </div>

        <Field label="Password" htmlFor="password" error={fieldErrors.password}>
          <div className="relative">
            <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={handleChange} placeholder="Create a secure password" error={fieldErrors.password} className="pr-12" />
            <button type="button" onClick={() => setShowPassword((c) => !c)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-loco-wine">
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {checks.map((check) => (
              <span key={check.text} className={`flex items-center gap-1.5 text-xs ${check.valid ? "text-green-700" : "text-gray-400"}`}><CheckCircle2 size={13} /> {check.text}</span>
            ))}
          </div>
        </Field>

        <Field label="Confirm password" htmlFor="confirmPassword" error={fieldErrors.confirmPassword}>
          <Input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} placeholder="Enter the password again" error={fieldErrors.confirmPassword} />
        </Field>

        <label className="flex items-start gap-3 text-sm leading-6 text-gray-600">
          <input type="checkbox" required className="mt-1 h-4 w-4 accent-loco-wine" />
          <span>I agree to the LOCO terms of use and privacy policy.</span>
        </label>

        <Button type="submit" className="w-full" loading={submitting}>
          {submitting ? "Creating account..." : form.role === "SELLER" ? "Create seller account" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account? <Link to="/login" className="font-bold text-loco-wine hover:text-loco-orange">Log in</Link>
      </p>
    </div>
  );
}
