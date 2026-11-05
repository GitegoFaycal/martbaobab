import { Router } from "express";
import {
  listCategories,
  listLocations,
} from "../controllers/category.controller.js";
import {
  createShop,
  getMyShop,
  getShop,
  listShops,
  updateMyShop,
} from "../controllers/shop.controller.js";
import {
  createListing,
  deleteListing,
  getListing,
  listListings,
  listMyListings,
  updateListing,
} from "../controllers/listing.controller.js";
import {
  createOrder,
  getOrder,
  listMyOrders,
  listShopOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import {
  listingQuerySchema,
  listingSchema,
  orderSchema,
  orderStatusSchema,
  shopSchema,
} from "../schemas/marketplace.schema.js";

export const categoryRouter = Router();
categoryRouter.get("/", listCategories);

export const locationRouter = Router();
locationRouter.get("/", listLocations);

const seller = [authenticate, authorize("SELLER", "ADMIN")];

export const shopRouter = Router();
shopRouter.get("/", listShops);
shopRouter.get("/me", ...seller, getMyShop);
shopRouter.post("/", ...seller, validate(shopSchema), createShop);
shopRouter.patch("/me", ...seller, validate(shopSchema), updateMyShop);
shopRouter.get("/:slug", getShop);

export const listingRouter = Router();
listingRouter.get("/", validate(listingQuerySchema), listListings);
listingRouter.get("/mine", ...seller, listMyListings);
listingRouter.post("/", ...seller, validate(listingSchema), createListing);
listingRouter.patch("/:id", ...seller, validate(listingSchema), updateListing);
listingRouter.delete("/:id", ...seller, deleteListing);
listingRouter.get("/:slug", getListing);

export const orderRouter = Router();
orderRouter.post("/", authenticate, validate(orderSchema), createOrder);
orderRouter.get("/mine", authenticate, listMyOrders);
orderRouter.get("/shop", ...seller, listShopOrders);
orderRouter.get("/:id", authenticate, getOrder);
orderRouter.patch(
  "/:id/status",
  authenticate,
  validate(orderStatusSchema),
  updateOrderStatus
);
