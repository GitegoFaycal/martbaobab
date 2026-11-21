import { Router } from "express";
import { getPerson, listPeople } from "../controllers/people.controller.js";
import optionalAuth from "../middleware/optionalAuth.js";
import publicCache from "../middleware/publicCache.js";

const router = Router();

router.get("/", publicCache(60), optionalAuth, listPeople);
router.get("/:id", optionalAuth, getPerson);

export default router;
