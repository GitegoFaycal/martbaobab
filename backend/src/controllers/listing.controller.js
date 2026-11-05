import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  httpError,
  paginate,
  paginationMeta,
  serialize,
  slugify,
  uniqueSlug,
} from "../utils/helpers.js";

const listingInclude = {
  images: { orderBy: { position: "asc" } },
  category: { select: { id: true, name: true, slug: true, kind: true } },
  shop: {
    select: {
      id: true,
      name: true,
      slug: true,
      district: true,
      sector: true,
      phone: true,
      whatsapp: true,
      verified: true,
      logoUrl: true,
    },
  },
};

function sortFor(sort) {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "popular":
      return { views: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export const listListings = asyncHandler(async (req, res) => {
  const q = req.validated.query;
  const paging = paginate(q);

  const where = {
    active: true,
    shop: { is: {} },
    ...(q.condition ? { condition: q.condition } : {}),
    ...(q.type ? { type: q.type } : {}),
    ...(q.category ? { category: { slug: q.category } } : {}),
    ...(q.shop ? { shop: { slug: q.shop } } : {}),
    ...(q.district
      ? {
          OR: [
            { district: q.district },
            { district: null, shop: { district: q.district } },
          ],
        }
      : {}),
    ...(q.minPrice != null || q.maxPrice != null
      ? {
          price: {
            ...(q.minPrice != null ? { gte: q.minPrice } : {}),
            ...(q.maxPrice != null ? { lte: q.maxPrice } : {}),
          },
        }
      : {}),
    ...(q.search
      ? {
          OR: [
            { name: { contains: q.search, mode: "insensitive" } },
            { description: { contains: q.search, mode: "insensitive" } },
            { shop: { name: { contains: q.search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  // Two OR blocks cannot coexist on one level; merge district + search safely.
  if (q.district && q.search) {
    where.AND = [
      {
        OR: [
          { district: q.district },
          { district: null, shop: { district: q.district } },
        ],
      },
      {
        OR: [
          { name: { contains: q.search, mode: "insensitive" } },
          { description: { contains: q.search, mode: "insensitive" } },
          { shop: { name: { contains: q.search, mode: "insensitive" } } },
        ],
      },
    ];
    delete where.OR;
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: { select: { name: true, slug: true } },
        shop: {
          select: {
            name: true,
            slug: true,
            district: true,
            verified: true,
          },
        },
      },
      orderBy: sortFor(q.sort),
      skip: paging.skip,
      take: paging.take,
    }),
    prisma.listing.count({ where }),
  ]);

  return res.status(200).json({
    success: true,
    listings: serialize(listings),
    pagination: paginationMeta(total, paging),
  });
});

export const getListing = asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { slug: req.params.slug },
    include: listingInclude,
  });

  if (!listing || !listing.active) {
    throw httpError(404, "Listing not found");
  }

  prisma.listing
    .update({ where: { id: listing.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  const related = await prisma.listing.findMany({
    where: {
      id: { not: listing.id },
      active: true,
      OR: [{ categoryId: listing.categoryId }, { shopId: listing.shopId }],
    },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      shop: { select: { name: true, slug: true, district: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return res.status(200).json({
    success: true,
    listing: serialize(listing),
    related: serialize(related),
  });
});

async function requireMyShop(userId) {
  const shop = await prisma.shop.findFirst({ where: { ownerId: userId } });

  if (!shop) {
    throw httpError(400, "Create your shop before adding listings");
  }

  return shop;
}

function listingData(body, shop) {
  return {
    name: body.name,
    description: body.description || null,
    type: body.type,
    condition: body.condition,
    price: body.price,
    originalPrice: body.condition === "USED" ? body.originalPrice ?? null : null,
    unit: body.unit || null,
    negotiable: body.negotiable,
    stock: body.stock ?? null,
    district: body.district || shop.district || null,
    categoryId: body.categoryId,
    active: body.active,
  };
}

export const listMyListings = asyncHandler(async (req, res) => {
  const shop = await requireMyShop(req.user.id);

  const listings = await prisma.listing.findMany({
    where: { shopId: shop.id },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ success: true, listings: serialize(listings) });
});

export const createListing = asyncHandler(async (req, res) => {
  const shop = await requireMyShop(req.user.id);
  const body = req.validated.body;

  const category = await prisma.category.findUnique({
    where: { id: body.categoryId },
  });

  if (!category || category.kind === "JOBS") {
    throw httpError(400, "Choose a goods or services category");
  }

  const baseSlug = slugify(body.name);
  const taken = await prisma.listing.findUnique({ where: { slug: baseSlug } });

  const listing = await prisma.listing.create({
    data: {
      ...listingData(body, shop),
      type: category.kind === "SERVICES" ? "SERVICE" : body.type,
      slug: taken ? uniqueSlug(body.name) : baseSlug,
      shopId: shop.id,
      images: {
        create: body.imageUrls.map((url, position) => ({
          url,
          position,
          alt: body.name,
        })),
      },
    },
    include: listingInclude,
  });

  return res.status(201).json({
    success: true,
    message: "Listing published",
    listing: serialize(listing),
  });
});

export const updateListing = asyncHandler(async (req, res) => {
  const shop = await requireMyShop(req.user.id);
  const body = req.validated.body;

  const existing = await prisma.listing.findFirst({
    where: { id: req.params.id, shopId: shop.id },
  });

  if (!existing) {
    throw httpError(404, "Listing not found");
  }

  const listing = await prisma.listing.update({
    where: { id: existing.id },
    data: {
      ...listingData(body, shop),
      images: {
        deleteMany: {},
        create: body.imageUrls.map((url, position) => ({
          url,
          position,
          alt: body.name,
        })),
      },
    },
    include: listingInclude,
  });

  return res.status(200).json({
    success: true,
    message: "Listing updated",
    listing: serialize(listing),
  });
});

export const deleteListing = asyncHandler(async (req, res) => {
  const shop = await requireMyShop(req.user.id);

  const existing = await prisma.listing.findFirst({
    where: { id: req.params.id, shopId: shop.id },
  });

  if (!existing) {
    throw httpError(404, "Listing not found");
  }

  await prisma.orderItem.deleteMany({ where: { listingId: existing.id } });
  await prisma.listing.delete({ where: { id: existing.id } });

  return res.status(200).json({ success: true, message: "Listing deleted" });
});
