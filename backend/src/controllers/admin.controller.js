import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { normalizePhone } from "../constants/rwanda.js";
import asyncHandler from "../utils/asyncHandler.js";
import { httpError, serialize, slugify, uniqueSlug } from "../utils/helpers.js";

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
    connections,
    connectionsWeek,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.shop.count(),
    prisma.shop.count({ where: { verified: false } }),
    prisma.listing.count({ where: { active: true } }),
    prisma.listing.count({ where: { active: true, condition: "USED" } }),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.jobApplication.count(),
    prisma.connection.count(),
    prisma.connection.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } } }),
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
      connections,
      connectionsWeek,
    },
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").trim();
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q.replace(/\s+/g, "") } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      district: true,
      active: true,
      createdAt: true,
      shops: { select: { id: true, name: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: q ? 20 : 200,
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
      _count: { select: { listings: true } },
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

const adminShopSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  logoUrl: true,
  coverUrl: true,
  phone: true,
  whatsapp: true,
  district: true,
  sector: true,
  address: true,
  verified: true,
  createdAt: true,
  owner: { select: { id: true, name: true, email: true, phone: true, role: true } },
  _count: { select: { listings: true } },
};

function shopData(body) {
  return {
    name: body.name,
    description: body.description || null,
    phone: normalizePhone(body.phone),
    whatsapp: normalizePhone(body.whatsapp),
    district: body.district,
    city: body.district,
    sector: body.sector || null,
    address: body.address || null,
    logoUrl: body.logoUrl || null,
    coverUrl: body.coverUrl || null,
  };
}

// Admin creates a shop on behalf of a seller: either an existing user
// (promoted to SELLER if needed) or a new seller account created here.
export const createShopForOwner = asyncHandler(async (req, res) => {
  const body = req.validated.body;
  let ownerId = body.ownerId || null;

  if (!ownerId) {
    const phone = normalizePhone(body.owner.phone);
    const clash = await prisma.user.findFirst({
      where: { OR: [{ email: body.owner.email }, { phone }] },
      select: { id: true, email: true },
    });
    if (clash) {
      throw httpError(409, clash.email === body.owner.email ? "An account with this email already exists" : "An account with this phone number already exists");
    }

    const owner = await prisma.user.create({
      data: {
        name: body.owner.name,
        email: body.owner.email,
        phone,
        district: body.owner.district || body.district,
        passwordHash: await bcrypt.hash(body.owner.password, 12),
        role: "SELLER",
      },
      select: { id: true },
    });
    ownerId = owner.id;
  } else {
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, role: true, shops: { select: { id: true, name: true }, take: 1 } },
    });
    if (!owner) throw httpError(404, "Owner not found");
    if (owner.shops.length) throw httpError(409, `This user already owns "${owner.shops[0].name}". Edit that shop instead.`);
    if (owner.role === "CUSTOMER") {
      await prisma.user.update({ where: { id: ownerId }, data: { role: "SELLER" } });
    }
  }

  const baseSlug = slugify(body.name);
  const taken = await prisma.shop.findUnique({ where: { slug: baseSlug } });

  const shop = await prisma.shop.create({
    data: {
      ...shopData(body),
      slug: taken ? uniqueSlug(body.name) : baseSlug,
      ownerId,
      verified: true,
    },
    select: adminShopSelect,
  });

  return res.status(201).json({ success: true, message: "Shop created", shop: serialize(shop) });
});

export const getShopForAdmin = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findUnique({
    where: { id: req.params.id },
    select: {
      ...adminShopSelect,
      listings: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { connections: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
          category: { select: { name: true, slug: true } },
        },
      },
    },
  });

  if (!shop) throw httpError(404, "Shop not found");

  return res.status(200).json({ success: true, shop: serialize(shop) });
});

export const updateShopForAdmin = asyncHandler(async (req, res) => {
  const existing = await prisma.shop.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!existing) throw httpError(404, "Shop not found");

  const shop = await prisma.shop.update({
    where: { id: existing.id },
    data: shopData(req.validated.body),
    select: adminShopSelect,
  });

  return res.status(200).json({ success: true, message: "Shop updated", shop: serialize(shop) });
});
