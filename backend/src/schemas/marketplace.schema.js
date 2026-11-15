import { z } from "zod";
import { DISTRICTS, RWANDA_PHONE_PATTERN } from "../constants/rwanda.js";

const optionalText = (max) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const district = z.enum(DISTRICTS, {
  message: "Choose a district in Rwanda",
});

const phone = z
  .string()
  .trim()
  .regex(RWANDA_PHONE_PATTERN, "Enter a valid Rwandan telephone number (07X XXX XXXX)");

const money = z.coerce
  .number({ message: "Enter an amount in RWF" })
  .min(0, "Amount cannot be negative")
  .max(1_000_000_000, "Amount is too large");

const imageUrls = z
  .array(z.string().trim().url("Each image must be a valid URL").max(500))
  .max(6, "Add at most 6 images")
  .optional()
  .default([]);

const shopFields = {
    name: z.string().trim().min(2, "Shop name is too short").max(80),
    description: optionalText(1000),
    phone,
    whatsapp: optionalText(20),
    district,
    sector: optionalText(60),
    address: optionalText(200),
    logoUrl: optionalText(500),
    coverUrl: optionalText(500),
};

export const shopSchema = z.object({ body: z.object(shopFields) });

// Who owns a shop: an existing user (ownerId) or a brand-new seller
// account (owner). Shared by shop creation and ownership transfer.
const ownerFields = {
  ownerId: z.string().trim().optional().or(z.literal("")),
  owner: z
    .object({
      name: z.string().trim().min(2, "Owner name is too short").max(100),
      email: z.string().trim().toLowerCase().email("Enter a valid email address"),
      phone,
      password: z
        .string()
        .min(8, "Password must contain at least 8 characters")
        .max(72)
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/[a-z]/, "Password must contain a lowercase letter")
        .regex(/[0-9]/, "Password must contain a number"),
      district: district.optional().or(z.literal("")),
    })
    .optional(),
};
const requireOwner = {
  message: "Choose an existing user or create the seller account",
  path: ["ownerId"],
};

export const adminShopSchema = z.object({
  body: z.object({ ...shopFields, ...ownerFields }).refine((data) => data.ownerId || data.owner, requireOwner),
});

export const assignOwnerSchema = z.object({
  body: z.object(ownerFields).refine((data) => data.ownerId || data.owner, requireOwner),
});

export const listingSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, "Name is too short").max(120),
      description: optionalText(3000),
      type: z.enum(["PRODUCT", "SERVICE"]).default("PRODUCT"),
      condition: z.enum(["NEW", "USED"]).default("NEW"),
      price: money,
      originalPrice: money.optional().nullable(),
      unit: optionalText(30),
      negotiable: z.coerce.boolean().default(false),
      stock: z.coerce.number().int().min(0).max(1_000_000).optional().nullable(),
      categoryId: z.string().min(1, "Choose a category"),
      district: district.optional(),
      active: z.coerce.boolean().default(true),
      imageUrls,
    })
    .refine(
      (data) =>
        data.condition !== "USED" ||
        data.originalPrice == null ||
        data.originalPrice >= data.price,
      {
        message: "The original price should be higher than the asking price",
        path: ["originalPrice"],
      }
    ),
});

export const listingQuerySchema = z.object({
  query: z.object({
    search: optionalText(100),
    category: optionalText(80),
    district: optionalText(40),
    condition: z.enum(["NEW", "USED"]).optional().or(z.literal("")),
    type: z.enum(["PRODUCT", "SERVICE"]).optional().or(z.literal("")),
    shop: optionalText(80),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: z
      .enum(["newest", "price_asc", "price_desc", "popular"])
      .optional()
      .or(z.literal("")),
    page: z.coerce.number().int().min(1).optional(),
    perPage: z.coerce.number().int().min(1).max(48).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
