import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";
import { apiRequest } from "../../api/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!token) {
      setError(
        "The reset link does not contain a token."
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError("The passwords do not match");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await apiRequest(
        "/account/reset-password",
        {
          method: "POST",
          body: {
            token,
            password: form.password,
            confirmPassword:
              form.confirmPassword,
          },
        }
      );

      setSuccess(response.message);

      setForm({
        password: "",
        confirmPassword: "",
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          "The password could not be reset."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
        <AlertCircle
          size={45}
          className="mx-auto text-red-600"
        />

        <h1 className="mt-5 text-3xl font-black text-baobab-wine">
          Invalid reset link
        </h1>

        <p className="mt-3 text-gray-500">
          Request a new password-reset link.
        </p>

        <Link
          to="/forgot-password"
          className="mt-7 inline-block rounded-full bg-baobab-wine px-6 py-3 font-bold text-white"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-orange-100/70 sm:p-9">
      <p className="font-bold text-baobab-orange">
        Account recovery
      </p>

      <h1 className="mt-2 text-3xl font-black text-baobab-wine">
        Choose a new password
      </h1>

      {error && (
        <StatusMessage
          type="error"
          text={error}
        />
      )}

      {success && (
        <div className="mt-6">
          <StatusMessage
            type="success"
            text={success}
          />

          <Link
            to="/login"
            className="mt-5 block rounded-xl bg-baobab-wine px-5 py-3.5 text-center font-bold text-white"
          >
            Continue to login
          </Link>
        </div>
      )}

      {!success && (
        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          <PasswordField
            name="password"
            label="New password"
            value={form.password}
            onChange={handleChange}
            visible={showPassword}
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm new password"
            value={form.confirmPassword}
            onChange={handleChange}
            visible={showPassword}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current
              )
            }
            className="inline-flex items-center gap-2 text-sm font-bold text-baobab-wine"
          >
            {showPassword ? (
              <EyeOff size={17} />
            ) : (
              <Eye size={17} />
            )}

            {showPassword
              ? "Hide password"
              : "Show password"}
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-baobab-wine px-5 py-3.5 font-bold text-white disabled:opacity-60"
          >
            {submitting && (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            )}

            {submitting
              ? "Resetting password..."
              : "Reset password"}
          </button>
        </form>
      )}
    </div>
  );
}

function PasswordField({
  name,
  label,
  value,
  onChange,
  visible,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold"
      >
        {label}
      </label>

      <div className="flex items-center rounded-xl border border-gray-200 px-4 focus-within:border-baobab-orange focus-within:ring-4 focus-within:ring-orange-100">
        <LockKeyhole
          size={19}
          className="text-gray-400"
        />

        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          required
          className="w-full bg-transparent px-3 py-3.5 outline-none"
        />
      </div>
    </div>
  );
}

function StatusMessage({ type, text }) {
  const success = type === "success";
  const Icon = success
    ? CheckCircle2
    : AlertCircle;

  return (
    <div
      className={`mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <Icon
        size={19}
        className="mt-0.5 shrink-0"
      />
      {text}
    </div>
  );
}