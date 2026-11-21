import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { normalizePhone } from "../constants/rwanda.js";
import { nearestIds, pageByDistance, parseNear, placeCentre } from "../services/geo.service.js";
import {
  httpError,
  paginate,
  paginationMeta,
  placeWhere,
  serialize,
  slugify,
  uniqueSlug,
} from "../utils/helpers.js";

const shopSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  logoUrl: true,
  coverUrl: true,
  phone: true,
  whatsapp: true,
  city: true,
  district: true,
  sector: true,
  cell: true,
  village: true,
  lat: true,
  lng: true,
  address: true,
  verified: true,
  createdAt: true,
  owner: { select: { id: true, name: true, views: true, _count: { select: { connectionsAsSeller: true } } } },
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
    cell: body.cell || null,
    village: body.village || null,
    ...coordsFor(body),
    address: body.address || null,
    logoUrl: body.logoUrl || null,
    coverUrl: body.coverUrl || null,
  };
}

// Pinned spot if given, otherwise the centre of the place.
function coordsFor(body) {
  if (Number.isFinite(body.lat) && Number.isFinite(body.lng)) return { lat: body.lat, lng: body.lng };
  const centre = placeCentre({ district: body.district, sector: body.sector, cell: body.cell });
  return { lat: centre?.lat ?? null, lng: centre?.lng ?? null };
}

export const listShops = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const paging = paginate(req.query);

  const where = {
    ...placeWhere(req.query),
    ...(search
      ? { name: { contains: String(search), mode: "insensitive" } }
      : {}),
  };

  const near = parseNear(req.query);
  if (near) {
    const ids = await nearestIds(prisma, "Shop", near, 1500);
    const candidates = ids.length ? await prisma.shop.findMany({ where: { ...where, id: { in: ids } }, select: { id: true, lat: true, lng: true } }) : [];
    const { rows, total } = await pageByDistance({
      candidates,
      near,
      coordsOf: (shop) => shop,
      paging,
      loadFull: (pageIds) => prisma.shop.findMany({ where: { id: { in: pageIds } }, select: shopSelect }),
    });
    return res.status(200).json({ success: true, shops: serialize(rows), pagination: paginationMeta(total, paging) });
  }

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      select: shopSelect,
      orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
      skip: paging.skip,
      take: paging.take,
    }),
    prisma.shop.count({ where }),
  ]);

  return res.status(200).json({
    success: true,
    shops: serialize(shops),
    pagination: paginationMeta(total, paging),
  });
});

export const getShop = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findUnique({
    where: { slug: req.params.slug },
    select: shopSelect,
  });

  if (!shop) {
    throw httpError(404, "Shop not found");
  }

  const listings = await prisma.listing.findMany({
    where: { shopId: shop.id, active: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 48,
  });

  return res.status(200).json({
    success: true,
    shop: serialize(shop),
    listings: serialize(listings),
  });
});

export const getMyShop = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findFirst({
    where: { ownerId: req.user.id },
    select: shopSelect,
  });

  return res.status(200).json({ success: true, shop: serialize(shop) });
});

export const createShop = asyncHandler(async (req, res) => {
  const existing = await prisma.shop.findFirst({
    where: { ownerId: req.user.id },
  });

  if (existing) {
    throw httpError(409, "You already have a shop. Edit it instead.");
  }

  const body = req.validated.body;
  const baseSlug = slugify(body.name);
  const taken = await prisma.shop.findUnique({ where: { slug: baseSlug } });

  const shop = await prisma.shop.create({
    data: {
      ...shopData(body),
      slug: taken ? uniqueSlug(body.name) : baseSlug,
      ownerId: req.user.id,
    },
    select: shopSelect,
  });

  return res.status(201).json({
    success: true,
    message: "Your shop is ready. Add your first listing.",
    shop: serialize(shop),
  });
});

export const updateMyShop = asyncHandler(async (req, res) => {
  const existing = await prisma.shop.findFirst({
    where: { ownerId: req.user.id },
  });

  if (!existing) {
    throw httpError(404, "Create your shop first");
  }

  const shop = await prisma.shop.update({
    where: { id: existing.id },
    data: shopData(req.validated.body),
    select: shopSelect,
  });

  return res.status(200).json({
    success: true,
    message: "Shop updated",
    shop: serialize(shop),
  });
});
