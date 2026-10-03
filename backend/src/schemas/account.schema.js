import { z } from "zod";

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

    phone: z
      .string()
      .trim()
      .max(20, "Telephone number is too long")
      .optional()
      .or(z.literal("")),
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