import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import {
  categoryRouter,
  listingRouter,
  locationRouter,
  shopRouter,
} from "./routes/marketplace.routes.js";
import { applicationRouter, jobRouter } from "./routes/job.routes.js";
import { imageRouter, uploadRouter } from "./routes/upload.routes.js";
import peopleRoutes from "./routes/people.routes.js";
import { connectionRouter, statsRouter } from "./routes/connection.routes.js";
import prisma from "./config/prisma.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";

const app = express();

// Running behind a proxy (Vercel, Render, Nginx) so req.ip and secure cookies work.
app.set("trust proxy", 1);

// Origins that may always call the API: local development and the production
// frontend. CLIENT_URL (comma-separated) adds more without a code change.
const defaultOrigins = [
  "http://localhost:5173",
  "https://martbaobab-frontend.vercel.app",
  "https://loco-frontend.vercel.app",
  "https://loco-rw.vercel.app",
];

const allowedOrigins = [
  ...defaultOrigins,
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

// Vercel preview deployments of the frontend, e.g.
// https://loco-frontend-git-feature-x-user.vercel.app
const vercelPreviewPattern = new RegExp(
  process.env.VERCEL_PREVIEW_PATTERN ||
    "^https://(martbaobab|loco)-frontend-[a-z0-9-]+\\.vercel\\.app$"
);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return vercelPreviewPattern.test(origin);
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

const writeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req) => req.method === "GET",
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", async (req, res) => {
  let database = "ok";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error("Database health check failed:", error.message);
    database = "unavailable";
  }

  res.status(database === "ok" ? 200 : 503).json({
    success: database === "ok",
    status: database === "ok" ? "ok" : "degraded",
    service: "LOCO API",
    database,
  });
});

app.use("/api/auth", authRateLimit, authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRouter);
app.use("/api/locations", locationRouter);
app.use("/api/shops", writeRateLimit, shopRouter);
app.use("/api/listings", writeRateLimit, listingRouter);
app.use("/api/jobs", writeRateLimit, jobRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/people", peopleRoutes);
app.use("/api/connections", connectionRouter);
app.use("/api/stats", statsRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/images", imageRouter);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
