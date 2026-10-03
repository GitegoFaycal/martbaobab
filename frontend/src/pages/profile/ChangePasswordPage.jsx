import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ChangePasswordPage() {
  const { changePassword } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] =
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
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      setError(
        "The new passwords do not match"
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await changePassword(
        form
      );

      setSuccess(response.message);

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          "The password could not be changed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-baobab-cream px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 font-bold text-baobab-wine"
        >
          <ArrowLeft size={18} />
          Back to profile
        </Link>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-lg sm:p-9">
          <p className="font-bold text-baobab-orange">
            Account security
          </p>

          <h1 className="mt-2 text-3xl font-black text-baobab-wine">
            Change password
          </h1>

          {error && (
            <StatusMessage
              type="error"
              text={error}
            />
          )}

          {success && (
            <StatusMessage
              type="success"
              text={success}
            />
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >
            <PasswordInput
              name="currentPassword"
              label="Current password"
              value={form.currentPassword}
              onChange={handleChange}
              visible={showPasswords}
            />

            <PasswordInput
              name="newPassword"
              label="New password"
              value={form.newPassword}
              onChange={handleChange}
              visible={showPasswords}
            />

            <PasswordInput
              name="confirmPassword"
              label="Confirm new password"
              value={form.confirmPassword}
              onChange={handleChange}
              visible={showPasswords}
            />

            <button
              type="button"
              onClick={() =>
                setShowPasswords(
                  (current) => !current
                )
              }
              className="inline-flex items-center gap-2 text-sm font-bold text-baobab-wine"
            >
              {showPasswords ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}

              {showPasswords
                ? "Hide passwords"
                : "Show passwords"}
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
                ? "Changing password..."
                : "Change password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function PasswordInput({
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
          required
          autoComplete={
            name === "currentPassword"
              ? "current-password"
              : "new-password"
          }
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
      className={`mt-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <Icon size={19} />
      {text}
    </div>
  );
}