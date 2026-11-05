import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { httpError, serialize } from "../utils/helpers.js";

export const getStats = asyncHandler(async (req, res) => {
  const [
    users,
    sellers,
    shops,
    unverifiedShops,
    listings,
    secondHand,
    openJobs,
    applications,
    orders,
    revenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.shop.count(),
    prisma.shop.count({ where: { verified: false } }),
    prisma.listing.count({ where: { active: true } }),
    prisma.listing.count({ where: { active: true, condition: "USED" } }),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.jobApplication.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "DELIVERED" },
    }),
  ]);

  return res.status(200).json({
    success: true,
    stats: {
      users,
      sellers,
      shops,
      unverifiedShops,
      listings,
      secondHand,
      openJobs,
      applications,
      orders,
      revenue: Number(revenue._sum.total || 0),
    },
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      district: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return res.status(200).json({ success: true, users: serialize(users) });
});

export const setUserActive = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    throw httpError(400, "You cannot disable your own account");
  }

  const active = Boolean(req.body?.active);

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { active },
    select: { id: true, name: true, active: true },
  });

  return res.status(200).json({
    success: true,
    message: active ? "Account enabled" : "Account disabled",
    user,
  });
});

export const listShopsForReview = asyncHandler(async (req, res) => {
  const shops = await prisma.shop.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      district: true,
      phone: true,
      verified: true,
      createdAt: true,
      owner: { select: { name: true, email: true } },
      _count: { select: { listings: true, orders: true } },
    },
    orderBy: [{ verified: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  return res.status(200).json({ success: true, shops: serialize(shops) });
});

export const setShopVerified = asyncHandler(async (req, res) => {
  const verified = Boolean(req.body?.verified);

  const shop = await prisma.shop.update({
    where: { id: req.params.id },
    data: { verified },
    select: { id: true, name: true, verified: true },
  });

  return res.status(200).json({
    success: true,
    message: verified ? "Shop verified" : "Verification removed",
    shop,
  });
});
