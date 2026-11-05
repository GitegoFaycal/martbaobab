import { z } from "zod";
import { DISTRICTS, RWANDA_PHONE_PATTERN } from "../constants/rwanda.js";

export const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(72, "Password must not exceed 72 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const phoneSchema = z
  .string()
  .trim()
  .regex(
    RWANDA_PHONE_PATTERN,
    "Enter a valid Rwandan telephone number, e.g. 078 123 4567"
  );

export const districtSchema = z.enum(DISTRICTS, {
  message: "Choose your district",
});

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100, "Name must not exceed 100 characters"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address"),

    phone: phoneSchema,

    district: districtSchema,

    password: passwordSchema,

    role: z.enum(["CUSTOMER", "SELLER"]).default("CUSTOMER"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address"),

    password: z.string().min(1, "Password is required"),
  }),
});
