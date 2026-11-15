import { Router } from "express";
import {
  createShopForOwner,
  getShopForAdmin,
  getStats,
  listShopsForReview,
  listUsers,
  setShopVerified,
  setUserActive,
  updateShopForAdmin,
} from "../controllers/admin.controller.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { adminShopSchema, shopSchema } from "../schemas/marketplace.schema.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/stats", getStats);
router.get("/users", listUsers);
router.patch("/users/:id/active", setUserActive);
router.get("/shops", listShopsForReview);
router.post("/shops", validate(adminShopSchema), createShopForOwner);
router.get("/shops/:id", getShopForAdmin);
router.patch("/shops/:id", validate(shopSchema), updateShopForAdmin);
router.patch("/shops/:id/verify", setShopVerified);

export default router;
