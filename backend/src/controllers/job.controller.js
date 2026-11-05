import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { normalizePhone } from "../constants/rwanda.js";
import {
  httpError,
  paginate,
  paginationMeta,
  serialize,
  slugify,
  uniqueSlug,
} from "../utils/helpers.js";

const jobCardInclude = {
  category: { select: { id: true, name: true, slug: true } },
  employer: { select: { id: true, name: true, district: true } },
  _count: { select: { applications: true } },
};

export const listJobs = asyncHandler(async (req, res) => {
  const q = req.validated.query;
  const paging = paginate(q);

  const where = {
    status: q.status || "OPEN",
    ...(q.district ? { district: q.district } : {}),
    ...(q.jobType ? { jobType: q.jobType } : {}),
    ...(q.category ? { category: { slug: q.category } } : {}),
    ...(q.search
      ? {
          OR: [
            { title: { contains: q.search, mode: "insensitive" } },
            { description: { contains: q.search, mode: "insensitive" } },
            { sector: { contains: q.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: jobCardInclude,
      orderBy: { createdAt: "desc" },
      skip: paging.skip,
      take: paging.take,
    }),
    prisma.job.count({ where }),
  ]);

  return res.status(200).json({
    success: true,
    jobs: serialize(jobs),
    pagination: paginationMeta(total, paging),
  });
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { slug: req.params.slug },
    include: {
      ...jobCardInclude,
      employer: {
        select: { id: true, name: true, district: true, createdAt: true },
      },
    },
  });

  if (!job) {
    throw httpError(404, "Job not found");
  }

  prisma.job
    .update({ where: { id: job.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  let myApplication = null;

  if (req.user) {
    myApplication = await prisma.jobApplication.findUnique({
      where: { jobId_applicantId: { jobId: job.id, applicantId: req.user.id } },
      select: { id: true, status: true, createdAt: true },
    });
  }

  const similar = await prisma.job.findMany({
    where: {
      id: { not: job.id },
      status: "OPEN",
      OR: [{ district: job.district }, { categoryId: job.categoryId }],
    },
    include: jobCardInclude,
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return res.status(200).json({
    success: true,
    job: serialize(job),
    myApplication: serialize(myApplication),
    similar: serialize(similar),
  });
});

function jobData(body) {
  return {
    title: body.title,
    description: body.description,
    requirements: body.requirements || null,
    categoryId: body.categoryId || null,
    district: body.district,
    sector: body.sector || null,
    jobType: body.jobType,
    payPeriod: body.payPeriod,
    payMin: body.payMin ?? null,
    payMax: body.payMax ?? null,
    workersNeeded: body.workersNeeded,
    startDate: body.startDate,
    durationText: body.durationText || null,
    contactPhone: normalizePhone(body.contactPhone),
    status: body.status,
  };
}

export const createJob = asyncHandler(async (req, res) => {
  const body = req.validated.body;

  if (body.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId },
    });

    if (!category || category.kind !== "JOBS") {
      throw httpError(400, "Choose a job category");
    }
  }

  const baseSlug = slugify(body.title);
  const taken = await prisma.job.findUnique({ where: { slug: baseSlug } });

  const job = await prisma.job.create({
    data: {
      ...jobData(body),
      slug: taken ? uniqueSlug(body.title) : baseSlug,
      employerId: req.user.id,
    },
    include: jobCardInclude,
  });

  return res.status(201).json({
    success: true,
    message: "Job posted. Workers nearby can now apply.",
    job: serialize(job),
  });
});

export const updateJob = asyncHandler(async (req, res) => {
  const existing = await prisma.job.findFirst({
    where: { id: req.params.id, employerId: req.user.id },
  });

  if (!existing) {
    throw httpError(404, "Job not found");
  }

  const job = await prisma.job.update({
    where: { id: existing.id },
    data: jobData(req.validated.body),
    include: jobCardInclude,
  });

  return res.status(200).json({
    success: true,
    message: "Job updated",
    job: serialize(job),
  });
});

export const closeJob = asyncHandler(async (req, res) => {
  const existing = await prisma.job.findFirst({
    where: { id: req.params.id, employerId: req.user.id },
  });

  if (!existing) {
    throw httpError(404, "Job not found");
  }

  const status = existing.status === "OPEN" ? "CLOSED" : "OPEN";

  const job = await prisma.job.update({
    where: { id: existing.id },
    data: { status },
    include: jobCardInclude,
  });

  return res.status(200).json({
    success: true,
    message: status === "OPEN" ? "Job reopened" : "Job closed",
    job: serialize(job),
  });
});

export const listMyJobs = asyncHandler(async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: { employerId: req.user.id },
    include: jobCardInclude,
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ success: true, jobs: serialize(jobs) });
});

export const applyToJob = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });

  if (!job || job.status !== "OPEN") {
    throw httpError(404, "This job is no longer open");
  }

  if (job.employerId === req.user.id) {
    throw httpError(400, "You cannot apply to your own job");
  }

  const body = req.validated.body;

  const existing = await prisma.jobApplication.findUnique({
    where: { jobId_applicantId: { jobId: job.id, applicantId: req.user.id } },
  });

  if (existing) {
    throw httpError(409, "You have already applied to this job");
  }

  const application = await prisma.jobApplication.create({
    data: {
      jobId: job.id,
      applicantId: req.user.id,
      phone: normalizePhone(body.phone),
      message: body.message || null,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Application sent. The employer will contact you by phone.",
    application: serialize(application),
  });
});

export const listJobApplications = asyncHandler(async (req, res) => {
  const job = await prisma.job.findFirst({
    where: { id: req.params.id, employerId: req.user.id },
    include: jobCardInclude,
  });

  if (!job) {
    throw httpError(404, "Job not found");
  }

  const applications = await prisma.jobApplication.findMany({
    where: { jobId: job.id },
    include: {
      applicant: {
        select: { id: true, name: true, district: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    job: serialize(job),
    applications: serialize(applications),
  });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await prisma.jobApplication.findUnique({
    where: { id: req.params.applicationId },
    include: { job: { select: { id: true, employerId: true } } },
  });

  if (
    !application ||
    application.job.id !== req.params.id ||
    application.job.employerId !== req.user.id
  ) {
    throw httpError(404, "Application not found");
  }

  const updated = await prisma.jobApplication.update({
    where: { id: application.id },
    data: { status: req.validated.body.status },
    include: {
      applicant: { select: { id: true, name: true, district: true } },
    },
  });

  return res.status(200).json({
    success: true,
    message: `Applicant marked as ${updated.status.toLowerCase()}`,
    application: serialize(updated),
  });
});

export const listMyApplications = asyncHandler(async (req, res) => {
  const applications = await prisma.jobApplication.findMany({
    where: { applicantId: req.user.id },
    include: {
      job: {
        include: jobCardInclude,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    applications: serialize(applications),
  });
});
