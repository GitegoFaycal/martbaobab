import { Router } from "express";
import { centreOfPlace, whereAmI } from "../controllers/geo.controller.js";

const router = Router();

router.get("/", whereAmI);
router.get("/centre", centreOfPlace);

export default router;
