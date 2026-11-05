import { Router } from "express";
import { getPerson, listPeople } from "../controllers/people.controller.js";

const router = Router();

router.get("/", listPeople);
router.get("/:id", getPerson);

export default router;
