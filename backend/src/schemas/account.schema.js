import { z } from "zod";
import { districtSchema, phoneSchema } from "./auth.schema.js";

const strongPassword = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(72, "Password must not exceed 72 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100, "Name must not exceed 100 characters"),

    phone: phoneSchema,

    district: districtSchema,

    avatarUrl: z
      .string()
      .trim()
      .url("Avatar must be a valid URL")
      .max(500)
      .optional()
      .or(z.literal("")),

    headline: z.string().trim().max(80, "Keep the headline under 80 characters").optional().or(z.literal("")),

    bio: z.string().trim().max(600, "Keep the bio under 600 characters").optional().or(z.literal("")),

    skills: z
      .array(z.string().trim().min(1).max(30))
      .max(8, "Add at most 8 skills")
      .optional()
      .default([]),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string()
        .min(1, "Current password is required"),

      newPassword: strongPassword,

      confirmPassword: z
        .string()
        .min(1, "Confirm the new password"),
    })
    .refine(
      (data) =>
        data.newPassword === data.confirmPassword,
      {
        message: "The new passwords do not match",
        path: ["confirmPassword"],
      }
    )
    .refine(
      (data) =>
        data.currentPassword !== data.newPassword,
      {
        message:
          "The new password must be different from the current password",
        path: ["newPassword"],
      }
    ),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(1, "Reset token is required"),
      password: strongPassword,
      confirmPassword: z
        .string()
        .min(1, "Confirm the new password"),
    })
    .refine(
      (data) =>
        data.password === data.confirmPassword,
      {
        message: "The passwords do not match",
        path: ["confirmPassword"],
      }
    ),
});