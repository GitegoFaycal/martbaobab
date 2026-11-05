import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  listMyConnections,
  publicStats,
  recordConnection,
} from "../controllers/connection.controller.js";
import authenticate from "../middleware/authenticate.js";
import optionalAuth from "../middleware/optionalAuth.js";

const connectRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});

export const connectionRouter = Router();
connectionRouter.post("/", connectRateLimit, optionalAuth, recordConnection);
connectionRouter.get("/mine", authenticate, listMyConnections);

export const statsRouter = Router();
statsRouter.get("/", publicStats);
