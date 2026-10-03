import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Phone,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function EditProfilePage() {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
  });

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
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
      });

      setSuccess(response.message);
    } catch (requestError) {
      setError(
        requestError.message ||
          "The profile could not be updated."
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
            Account settings
          </p>

          <h1 className="mt-2 text-3xl font-black text-baobab-wine">
            Edit profile
          </h1>

          {error && (
            <Message
              type="error"
              text={error}
            />
          )}

          {success && (
            <Message
              type="success"
              text={success}
            />
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >
            <ProfileInput
              name="name"
              label="Full name"
              value={form.name}
              onChange={handleChange}
              icon={UserRound}
              required
            />

            <ProfileInput
              name="phone"
              label="Telephone number"
              value={form.phone}
              onChange={handleChange}
              icon={Phone}
              type="tel"
            />

            <div>
              <label className="mb-2 block text-sm font-bold">
                Email address
              </label>

              <input
                value={user.email}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3.5 text-gray-500"
              />

              <p className="mt-2 text-xs text-gray-500">
                Email changes will require a separate verification process.
              </p>
            </div>

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
                ? "Saving..."
                : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function ProfileInput({
  name,
  label,
  value,
  onChange,
  icon: Icon,
  type = "text",
  required = false,
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
        <Icon
          size={19}
          className="text-gray-400"
        />

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-transparent px-3 py-3.5 outline-none"
        />
      </div>
    </div>
  );
}

function Message({ type, text }) {
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