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
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import publicCache from "../middleware/publicCache.js";
import {
  listingQuerySchema,
  listingSchema,
  shopSchema,
} from "../schemas/marketplace.schema.js";

export const categoryRouter = Router();
categoryRouter.get("/", publicCache(300), listCategories);

export const locationRouter = Router();
locationRouter.get("/", publicCache(300), listLocations);

const seller = [authenticate, authorize("SELLER", "ADMIN")];

export const shopRouter = Router();
shopRouter.get("/", publicCache(60), listShops);
shopRouter.get("/me", ...seller, getMyShop);
shopRouter.post("/", ...seller, validate(shopSchema), createShop);
shopRouter.patch("/me", ...seller, validate(shopSchema), updateMyShop);
shopRouter.get("/:slug", publicCache(60), getShop);

export const listingRouter = Router();
listingRouter.get("/", publicCache(60), validate(listingQuerySchema), listListings);
listingRouter.get("/mine", ...seller, listMyListings);
listingRouter.post("/", ...seller, validate(listingSchema), createListing);
listingRouter.patch("/:id", ...seller, validate(listingSchema), updateListing);
listingRouter.delete("/:id", ...seller, deleteListing);
listingRouter.get("/:slug", getListing);
