import { Router } from "express";
import { centreOfPlace, whereAmI } from "../controllers/geo.controller.js";
import publicCache from "../middleware/publicCache.js";

const router = Router();

router.get("/", whereAmI);
router.get("/centre", publicCache(3600), centreOfPlace);

export default router;
