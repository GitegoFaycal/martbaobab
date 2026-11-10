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

// Two builds can overlap on Vercel and fight for Prisma's advisory lock
// (P1002); retry a few times before giving up.
function migrateDeploy() {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      execFileSync(process.execPath, [prismaCli, "migrate", "deploy"], {
        stdio: "inherit",
        env: process.env,
      });
      return;
    } catch (error) {
      if (attempt === 5) throw error;
      console.log(`migrate deploy failed (attempt ${attempt}); retrying in 20s...`);
      execFileSync(process.execPath, ["-e", "setTimeout(() => {}, 20000)"]);
    }
  }
}

try {
  migrateDeploy();

  execFileSync(process.execPath, ["prisma/seed.js"], {
    stdio: "inherit",
    env: process.env,
  });

  // Demo content: always when SEED_DEMO=true, otherwise only on an empty
  // marketplace so a fresh deployment is not blank. SEED_DEMO=false disables.
  if (process.env.SEED_DEMO !== "false") {
    execFileSync(process.execPath, ["prisma/demo.js"], {
      stdio: "inherit",
      env: process.env,
    });
  }
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
