import { AlertCircle, CheckCircle2, LoaderCircle, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { DISTRICTS, PROVINCES } from "../lib/rwanda";
import { toneClasses } from "../lib/format";

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-loco-ink outline-none focus:ring-4 disabled:bg-gray-100 disabled:text-gray-500";

function inputClasses(error) {
  return `${inputBase} ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-loco-orange focus:ring-orange-100"
  }`;
}

export function Field({ label, htmlFor, error, hint, optional, children }) {
  return (
    <div>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-2 block text-sm font-bold text-loco-ink"
        >
          {label}
          {optional && (
            <span className="ml-1 font-normal text-gray-400">(optional)</span>
          )}
        </label>
      )}

      {children}

      {error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      aria-invalid={Boolean(error)}
      className={`${inputClasses(error)} ${className}`}
    />
  );
}

export function Textarea({ error, className = "", rows = 4, ...props }) {
  return (
    <textarea
      {...props}
      rows={rows}
      aria-invalid={Boolean(error)}
      className={`${inputClasses(error)} ${className}`}
    />
  );
}

export function Select({ error, className = "", children, ...props }) {
  return (
    <select
      {...props}
      aria-invalid={Boolean(error)}
      className={`${inputClasses(error)} ${className}`}
    >
      {children}
    </select>
  );
}

export function DistrictSelect({ placeholder = "Choose a district", ...props }) {
  return (
    <Select {...props}>
      <option value="">{placeholder}</option>
      {Object.entries(PROVINCES).map(([province, districts]) => (
        <optgroup key={province} label={province}>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}

export { DISTRICTS };

export function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  ...props
}) {
  const variants = {
    primary: "bg-loco-wine text-white hover:bg-loco-wine-dark",
    orange: "bg-loco-orange text-white hover:bg-loco-orange-dark",
    mint: "bg-loco-mint text-loco-wine-dark hover:bg-loco-mint-dark",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#1ebe5d]",
    outline:
      "border border-loco-wine text-loco-wine hover:bg-loco-cream bg-white",
    ghost: "text-loco-wine hover:bg-loco-cream",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3",
    lg: "px-7 py-3.5 text-lg",
  };

  return (
    <Component
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <LoaderCircle size={18} className="animate-spin" />}
      {children}
    </Component>
  );
}

export function Message({ type = "error", children, className = "" }) {
  const success = type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      } ${className}`}
    >
      <Icon size={19} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function Badge({ tone = "amber", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${toneClasses(
        tone
      )} ${className}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-loco-wine">
      <LoaderCircle size={28} className="animate-spin text-loco-orange" />
      <span className="font-semibold">{label}</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
}) {
  return (
    <div className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-14 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-loco-cream text-loco-wine">
        <Icon size={30} />
      </span>
      <h3 className="mt-5 text-xl font-black text-loco-wine">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-gray-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action, children }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="font-bold text-loco-orange">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-black text-loco-wine sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-gray-600">{description}</p>
        )}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages } = pagination;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-2"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </Button>
      <span className="px-3 text-sm font-semibold text-gray-600">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.to ? (
              <Link to={item.to} className="font-semibold hover:text-loco-wine">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-loco-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Container({ className = "", children }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 ${className}`}>
      {children}
    </div>
  );
}

export function Page({ className = "", children }) {
  return (
    <main className={`min-h-[75vh] bg-loco-cream py-10 ${className}`}>
      <Container>{children}</Container>
    </main>
  );
}
