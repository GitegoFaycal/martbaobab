import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function uniqueSlug(value) {
  const base = slugify(value) || "item";
  return `${base}-${randomBytes(3).toString("hex")}`;
}

export function orderReference() {
  const stamp = Date.now().toString(36).toUpperCase();
  return `LOCO-${stamp}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

// Prisma returns Decimal objects; convert them (recursively) to numbers so
// JSON responses carry plain values the frontend can format.
export function serialize(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Prisma.Decimal) {
    return Number(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serialize(item)])
    );
  }

  return value;
}

export function paginate(query, defaults = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const perPage = Math.min(
    48,
    Math.max(1, Number(query.perPage) || defaults.perPage || 12)
  );

  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
    take: perPage,
  };
}

export function paginationMeta(total, { page, perPage }) {
  return {
    page,
    perPage,
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
