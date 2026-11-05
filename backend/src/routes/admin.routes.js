import { Router } from "express";
import {
  getStats,
  listShopsForReview,
  listUsers,
  setShopVerified,
  setUserActive,
} from "../controllers/admin.controller.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/stats", getStats);
router.get("/users", listUsers);
router.patch("/users/:id/active", setUserActive);
router.get("/shops", listShopsForReview);
router.patch("/shops/:id/verify", setShopVerified);

export default router;
