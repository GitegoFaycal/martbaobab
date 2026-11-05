import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { DISTRICTS, PROVINCES } from "../constants/rwanda.js";

export const listCategories = asyncHandler(async (req, res) => {
  const kind = ["GOODS", "SERVICES", "JOBS"].includes(req.query.kind)
    ? req.query.kind
    : undefined;

  const categories = await prisma.category.findMany({
    where: kind ? { kind } : undefined,
    orderBy: [{ kind: "asc" }, { position: "asc" }, { name: "asc" }],
  });

  return res.status(200).json({ success: true, categories });
});

export const listLocations = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    provinces: PROVINCES,
    districts: DISTRICTS,
  });
});
