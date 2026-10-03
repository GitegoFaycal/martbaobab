import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiRequest(
        "/account/forgot-password",
        {
          method: "POST",
          body: {
            email: email
              .trim()
              .toLowerCase(),
          },
        }
      );

      setSuccess(response.message);
    } catch (requestError) {
      setError(
        requestError.message ||
          "The reset request could not be completed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-orange-100/70 sm:p-9">
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm font-bold text-baobab-wine"
      >
        <ArrowLeft size={17} />
        Back to login
      </Link>

      <p className="mt-7 font-bold text-baobab-orange">
        Account recovery
      </p>

      <h1 className="mt-2 text-3xl font-black text-baobab-wine">
        Forgot your password?
      </h1>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        Enter the email address connected to
        your MartBaobab account.
      </p>

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
        <div>
          <label
            htmlFor="recovery-email"
            className="mb-2 block text-sm font-bold"
          >
            Email address
          </label>

          <div className="flex items-center rounded-xl border border-gray-200 px-4 focus-within:border-baobab-orange focus-within:ring-4 focus-within:ring-orange-100">
            <Mail
              size={19}
              className="text-gray-400"
            />

            <input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
                setSuccess("");
              }}
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="w-full bg-transparent px-3 py-3.5 outline-none"
            />
          </div>
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
            ? "Preparing reset link..."
            : "Send reset instructions"}
        </button>
      </form>
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