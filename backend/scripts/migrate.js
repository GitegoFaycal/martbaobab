// Runs database migrations (and the idempotent seed) using the resolved
// connection string. Used by the Vercel build so production never needs a
// manual `prisma migrate deploy`.
import "dotenv/config";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import {
  applyDatabaseUrl,
  describeDatabaseUrl,
} from "../src/config/database-url.js";

const require = createRequire(import.meta.url);
const prismaCli = require.resolve("prisma/build/index.js");

const url = applyDatabaseUrl();

if (!url) {
  console.error("No database URL found. Skipping migrations.");
  process.exit(process.env.VERCEL ? 0 : 1);
}

console.log(`Applying migrations to ${describeDatabaseUrl(url)}`);

try {
  execFileSync(process.execPath, [prismaCli, "migrate", "deploy"], {
    stdio: "inherit",
    env: process.env,
  });

  execFileSync(process.execPath, ["prisma/seed.js"], {
    stdio: "inherit",
    env: process.env,
  });
} catch (error) {
  console.error("");
  console.error("==================================================");
  console.error("Database setup failed. The API will report the");
  console.error("database as unavailable until the connection is fixed.");
  console.error("==================================================");

  // On Vercel, keep the deployment alive so the health check can explain
  // the problem; locally, fail fast.
  process.exit(process.env.VERCEL ? 0 : 1);
}
