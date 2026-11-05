const rwf = new Intl.NumberFormat("en-RW", {
  maximumFractionDigits: 0,
});

export function formatRWF(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return `RWF ${rwf.format(Number(value))}`;
}

export function formatDate(value, options) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    options || { day: "numeric", month: "short", year: "numeric" }
  ).format(new Date(value));
}

export function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} d ago`;

  return formatDate(value);
}

export function discountPercent(originalPrice, price) {
  if (!originalPrice || !price || Number(originalPrice) <= Number(price)) {
    return 0;
  }

  return Math.round((1 - Number(price) / Number(originalPrice)) * 100);
}

export const JOB_TYPES = {
  DAILY: "Daily work",
  CONTRACT: "Contract",
  PART_TIME: "Part time",
  FULL_TIME: "Full time",
};

export const PAY_PERIODS = {
  PER_DAY: "per day",
  PER_WEEK: "per week",
  PER_MONTH: "per month",
  PER_TASK: "per task",
};

export function formatPay(job) {
  const period = PAY_PERIODS[job.payPeriod] || "";

  if (job.payMin && job.payMax && job.payMin !== job.payMax) {
    return `${formatRWF(job.payMin)} – ${formatRWF(job.payMax)} ${period}`;
  }

  if (job.payMin || job.payMax) {
    return `${formatRWF(job.payMin || job.payMax)} ${period}`;
  }

  return "Pay negotiable";
}

export const ORDER_STATUS = {
  PENDING: { label: "Pending", tone: "amber" },
  CONFIRMED: { label: "Confirmed", tone: "blue" },
  PREPARING: { label: "Preparing", tone: "blue" },
  READY: { label: "Ready", tone: "mint" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", tone: "mint" },
  DELIVERED: { label: "Delivered", tone: "green" },
  CANCELLED: { label: "Cancelled", tone: "red" },
};

export const APPLICATION_STATUS = {
  PENDING: { label: "Pending", tone: "amber" },
  SHORTLISTED: { label: "Shortlisted", tone: "blue" },
  ACCEPTED: { label: "Accepted", tone: "green" },
  REJECTED: { label: "Not selected", tone: "red" },
};

export const PAYMENT_PROVIDERS = {
  MTN_MOMO: "MTN Mobile Money",
  AIRTEL_MONEY: "Airtel Money",
  CASH_ON_DELIVERY: "Cash on delivery",
};

export function toneClasses(tone) {
  switch (tone) {
    case "green":
      return "bg-green-50 text-green-700 border-green-200";
    case "mint":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "blue":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "red":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
