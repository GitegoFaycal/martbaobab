import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  changePassword,
  forgotPassword,
  resetPassword,
  updateProfile,
} from "../controllers/account.controller.js";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "../schemas/account.schema.js";

const router = Router();

const recoveryRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

router.patch(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  updateProfile
);

router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  changePassword
);

router.post(
  "/forgot-password",
  recoveryRateLimit,
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  recoveryRateLimit,
  validate(resetPasswordSchema),
  resetPassword
);

export default router;