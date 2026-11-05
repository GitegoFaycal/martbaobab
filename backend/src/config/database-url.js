// Resolves the PostgreSQL connection string LOCO should use.
//
// Hosted providers inject different variable names. The Vercel + Prisma
// Postgres integration, for example, sets DATABASE_URL to a
// "prisma+postgres://" Accelerate URL and POSTGRES_URL to a direct
// "postgres://" URL. Prisma CLI migrations and a plain Prisma Client both
// need the direct one, so prefer any variable that holds a direct URL.

const CANDIDATES = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
  "PRISMA_DATABASE_URL",
];

function isDirect(url) {
  return /^postgres(ql)?:\/\//i.test(url || "");
}

export function resolveDatabaseUrl(env = process.env) {
  const direct = CANDIDATES.map((name) => env[name]).find(isDirect);

  if (direct) {
    return direct;
  }

  return CANDIDATES.map((name) => env[name]).find(Boolean) || "";
}

export function describeDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}`;
  } catch {
    return url ? "unparseable URL" : "not set";
  }
}

export function applyDatabaseUrl(env = process.env) {
  const url = resolveDatabaseUrl(env);

  if (url) {
    env.DATABASE_URL = url;
  }

  if (env.NODE_ENV === "production") {
    const target = describeDatabaseUrl(url);

    if (!url) {
      console.error("DATABASE_URL is not set. Connect a PostgreSQL database.");
    } else if (/localhost|127\.0\.0\.1/.test(target)) {
      console.error(
        `DATABASE_URL points at ${target}, which does not exist in production.`
      );
    } else if (!isDirect(url)) {
      console.error(
        `DATABASE_URL (${target}) is not a direct postgres:// URL. Add POSTGRES_URL or a direct connection string.`
      );
    }
  }

  return url;
}
