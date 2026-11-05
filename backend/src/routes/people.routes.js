import { Router } from "express";
import { getPerson, listPeople } from "../controllers/people.controller.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = Router();

router.get("/", listPeople);
router.get("/:id", optionalAuth, getPerson);

export default router;
