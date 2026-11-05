import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  serveImage,
  uploadImage,
  uploadMiddleware,
} from "../controllers/upload.controller.js";
import authenticate from "../middleware/authenticate.js";

const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many uploads. Please wait a few minutes.",
  },
});

export const uploadRouter = Router();
uploadRouter.post("/", authenticate, uploadRateLimit, uploadMiddleware, uploadImage);

export const imageRouter = Router();
imageRouter.get("/:id", serveImage);
