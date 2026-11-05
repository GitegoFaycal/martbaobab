import { Router } from "express";
import {
  applyToJob,
  closeJob,
  createJob,
  getJob,
  listJobApplications,
  listJobs,
  listMyApplications,
  listMyJobs,
  updateApplicationStatus,
  updateJob,
} from "../controllers/job.controller.js";
import authenticate from "../middleware/authenticate.js";
import optionalAuth from "../middleware/optionalAuth.js";
import validate from "../middleware/validate.js";
import {
  applicationStatusSchema,
  applySchema,
  jobQuerySchema,
  jobSchema,
} from "../schemas/job.schema.js";

export const jobRouter = Router();

jobRouter.get("/", validate(jobQuerySchema), listJobs);
jobRouter.get("/mine", authenticate, listMyJobs);
jobRouter.post("/", authenticate, validate(jobSchema), createJob);
jobRouter.patch("/:id", authenticate, validate(jobSchema), updateJob);
jobRouter.patch("/:id/toggle", authenticate, closeJob);
jobRouter.post("/:id/apply", authenticate, validate(applySchema), applyToJob);
jobRouter.get("/:id/applications", authenticate, listJobApplications);
jobRouter.patch(
  "/:id/applications/:applicationId",
  authenticate,
  validate(applicationStatusSchema),
  updateApplicationStatus
);
jobRouter.get("/:slug", optionalAuth, getJob);

export const applicationRouter = Router();
applicationRouter.get("/mine", authenticate, listMyApplications);
