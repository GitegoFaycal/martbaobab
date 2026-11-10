import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { httpError, serialize } from "../utils/helpers.js";

const CHANNELS = new Set(["WHATSAPP", "CALL", "CONNECT"]);
const DEDUPE_MINUTES = 60;

function visitorKeyFrom(req) {
  const key = req.get("x-loco-visitor");
  return typeof key === "string" && /^[a-zA-Z0-9_-]{8,64}$/.test(key) ? key : null;
}

// POST /api/connections  { listingId?, personId?, channel }
// Records that a buyer reached out to a seller. Repeated taps by the same
// person on the same listing within an hour count once.
export const recordConnection = asyncHandler(async (req, res) => {
  const { listingId, personId } = req.body || {};
  const channel = CHANNELS.has(req.body?.channel) ? req.body.channel : "WHATSAPP";
  const visitorKey = visitorKeyFrom(req);
  const buyerId = req.user?.id || null;

  let sellerId = null;
  let source = "PROFILE";
  let listing = null;

  if (listingId) {
    listing = await prisma.listing.findUnique({
      where: { id: String(listingId) },
      select: { id: true, shop: { select: { ownerId: true } } },
    });

    if (!listing) {
      throw httpError(404, "Listing not found");
    }

    sellerId = listing.shop.ownerId;
    source = "LISTING";
  } else if (personId) {
    const person = await prisma.user.findUnique({
      where: { id: String(personId) },
      select: { id: true, active: true },
    });

    if (!person || !person.active) {
      throw httpError(404, "Profile not found");
    }

    sellerId = person.id;
  } else {
    throw httpError(400, "listingId or personId is required");
  }

  if (buyerId && buyerId === sellerId) {
    return res.status(200).json({ success: true, counted: false, reason: "self" });
  }

  if (channel === "CONNECT" && !buyerId) {
    throw httpError(401, "Log in to connect");
  }

  if (!buyerId && !visitorKey) {
    return res.status(200).json({ success: true, counted: false, reason: "anonymous" });
  }

  // In-app connections are permanent: one per pair of people.
  const since = channel === "CONNECT" ? new Date(0) : new Date(Date.now() - DEDUPE_MINUTES * 60 * 1000);

  const recent = await prisma.connection.findFirst({
    where: {
      sellerId,
      ...(channel === "CONNECT" ? { channel: "CONNECT" } : { listingId: listing ? listing.id : null }),
      createdAt: { gte: since },
      ...(buyerId ? { buyerId } : { visitorKey }),
    },
    select: { id: true },
  });

  if (recent) {
    return res.status(200).json({ success: true, counted: false, reason: "duplicate" });
  }

  await prisma.connection.create({
    data: {
      channel,
      source,
      listingId: listing ? listing.id : null,
      sellerId,
      buyerId,
      visitorKey: buyerId ? null : visitorKey,
    },
  });

  return res.status(201).json({ success: true, counted: true });
});

const connectionInclude = {
  listing: {
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  },
  seller: { select: { id: true, name: true, avatarUrl: true, district: true, headline: true } },
  buyer: { select: { id: true, name: true, avatarUrl: true, district: true } },
};

// GET /api/connections/mine
export const listMyConnections = asyncHandler(async (req, res) => {
  const [asSeller, asBuyer, sellerCount, buyerCount] = await Promise.all([
    prisma.connection.findMany({
      where: { sellerId: req.user.id },
      include: connectionInclude,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.connection.findMany({
      where: { buyerId: req.user.id },
      include: connectionInclude,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.connection.count({ where: { sellerId: req.user.id } }),
    prisma.connection.count({ where: { buyerId: req.user.id } }),
  ]);

  return res.status(200).json({
    success: true,
    asSeller: serialize(asSeller),
    asBuyer: serialize(asBuyer),
    totals: { asSeller: sellerCount, asBuyer: buyerCount },
  });
});

// GET /api/stats  (public counters for the homepage)
export const publicStats = asyncHandler(async (req, res) => {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [connections, connectionsToday, people, shops, listings, jobs] = await Promise.all([
    prisma.connection.count(),
    prisma.connection.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.user.count({ where: { active: true, OR: [{ shops: { some: {} } }, { headline: { not: null } }] } }),
    prisma.shop.count(),
    prisma.listing.count({ where: { active: true } }),
    prisma.job.count({ where: { status: "OPEN" } }),
  ]);

  res.set("Cache-Control", "public, max-age=60");

  return res.status(200).json({
    success: true,
    stats: { connections, connectionsToday, people, shops, listings, jobs },
  });
});
