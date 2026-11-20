import { Router } from "express";
import { whereAmI } from "../controllers/geo.controller.js";

const router = Router();

router.get("/", whereAmI);

export default router;
