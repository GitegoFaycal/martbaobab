import { z } from "zod";
import { DISTRICTS, RWANDA_PHONE_PATTERN } from "../constants/rwanda.js";

const optionalText = (max) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const money = z.coerce.number().min(0).max(1_000_000_000);

export const jobSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(4, "Give the job a clear title").max(120),
      description: z
        .string()
        .trim()
        .min(20, "Describe the work in at least 20 characters")
        .max(4000),
      requirements: optionalText(2000),
      categoryId: optionalText(80),
      district: z.enum(DISTRICTS, { message: "Choose a district in Rwanda" }),
      sector: optionalText(60),
      jobType: z
        .enum(["DAILY", "CONTRACT", "PART_TIME", "FULL_TIME"])
        .default("DAILY"),
      payPeriod: z
        .enum(["PER_DAY", "PER_WEEK", "PER_MONTH", "PER_TASK"])
        .default("PER_DAY"),
      payMin: money.optional().nullable(),
      payMax: money.optional().nullable(),
      workersNeeded: z.coerce.number().int().min(1).max(10_000).default(1),
      startDate: z
        .string()
        .trim()
        .optional()
        .or(z.literal(""))
        .transform((value) => (value ? new Date(value) : null))
        .refine((value) => value === null || !Number.isNaN(value.getTime()), {
          message: "Enter a valid start date",
        }),
      durationText: optionalText(80),
      contactPhone: z
        .string()
        .trim()
        .regex(RWANDA_PHONE_PATTERN, "Enter a valid Rwandan telephone number")
        .optional()
        .or(z.literal("")),
      status: z.enum(["OPEN", "CLOSED", "FILLED"]).default("OPEN"),
    })
    .refine(
      (data) =>
        data.payMin == null || data.payMax == null || data.payMax >= data.payMin,
      {
        message: "Maximum pay must be at least the minimum pay",
        path: ["payMax"],
      }
    ),
});

export const jobQuerySchema = z.object({
  query: z.object({
    search: optionalText(100),
    category: optionalText(80),
    district: optionalText(40),
    jobType: z
      .enum(["DAILY", "CONTRACT", "PART_TIME", "FULL_TIME"])
      .optional()
      .or(z.literal("")),
    status: z.enum(["OPEN", "CLOSED", "FILLED"]).optional().or(z.literal("")),
    page: z.coerce.number().int().min(1).optional(),
    perPage: z.coerce.number().int().min(1).max(48).optional(),
  }),
});

export const applySchema = z.object({
  body: z.object({
    phone: z
      .string()
      .trim()
      .regex(RWANDA_PHONE_PATTERN, "Enter a valid Rwandan telephone number"),
    message: optionalText(1500),
  }),
});

export const applicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "SHORTLISTED", "ACCEPTED", "REJECTED"]),
  }),
});
