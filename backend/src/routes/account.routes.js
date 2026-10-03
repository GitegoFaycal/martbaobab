import { Router } from "express";
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
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPassword
);

export default router;