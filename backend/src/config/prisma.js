import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrl } from "./database-url.js";

const databaseUrl = applyDatabaseUrl();

const prisma = new PrismaClient({
  ...(databaseUrl ? { datasourceUrl: databaseUrl } : {}),
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export default prisma;
