import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  httpError,
  paginate,
  paginationMeta,
  serialize,
} from "../utils/helpers.js";

const personSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  district: true,
  headline: true,
  bio: true,
  skills: true,
  views: true,
  role: true,
  createdAt: true,
  shops: {
    select: {
      id: true,
      name: true,
      slug: true,
      district: true,
      sector: true,
      verified: true,
      logoUrl: true,
      description: true,
      phone: true,
      whatsapp: true,
      _count: { select: { listings: true } },
    },
    take: 1,
  },
  _count: { select: { jobs: { where: { status: "OPEN" } }, connectionsAsSeller: true } },
};

// A "person" on LOCO is anyone who offers something locally: a shop owner,
// or someone who described what they do in their profile.
function publicPeopleWhere(q = {}) {
  const base = {
    active: true,
    OR: [{ shops: { some: {} } }, { headline: { not: null } }],
  };

  const filters = [];

  if (q.district) {
    filters.push({ district: q.district });
  }

  if (q.kind === "sellers") {
    filters.push({ shops: { some: {} } });
  } else if (q.kind === "specialists") {
    filters.push({ headline: { not: null } });
  }

  if (q.search) {
    const contains = { contains: q.search, mode: "insensitive" };
    filters.push({
      OR: [
        { name: contains },
        { headline: contains },
        { bio: contains },
        { skills: { has: q.search } },
        { shops: { some: { name: contains } } },
        { shops: { some: { description: contains } } },
      ],
    });
  }

  return filters.length ? { AND: [base, ...filters] } : base;
}

export const listPeople = asyncHandler(async (req, res) => {
  const q = {
    district: req.query.district ? String(req.query.district) : "",
    search: req.query.search ? String(req.query.search).trim().slice(0, 80) : "",
    kind: ["sellers", "specialists"].includes(req.query.kind) ? req.query.kind : "",
  };
  const paging = paginate(req.query, { perPage: 24 });
  const where = publicPeopleWhere(q);

  const [people, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: personSelect,
      orderBy: [{ avatarUrl: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      skip: paging.skip,
      take: paging.take,
    }),
    prisma.user.count({ where }),
  ]);

  return res.status(200).json({
    success: true,
    people: serialize(people.map(shapePerson)),
    pagination: paginationMeta(total, paging),
  });
});

export const getPerson = asyncHandler(async (req, res) => {
  const person = await prisma.user.findFirst({
    where: { id: req.params.id, ...publicPeopleWhere() },
    select: { ...personSelect, phone: true },
  });

  if (!person) {
    throw httpError(404, "Profile not found");
  }

  if (req.user?.id !== person.id) {
    prisma.user
      .update({ where: { id: person.id }, data: { views: { increment: 1 } } })
      .catch(() => {});
  }

  const shop = person.shops[0];

  const [listings, jobs] = await Promise.all([
    shop
      ? prisma.listing.findMany({
          where: { shopId: shop.id, active: true },
          include: {
            images: { orderBy: { position: "asc" }, take: 1 },
            category: { select: { name: true, slug: true } },
            shop: { select: { name: true, slug: true, district: true, verified: true } },
          },
          orderBy: [{ type: "desc" }, { createdAt: "desc" }],
          take: 12,
        })
      : [],
    prisma.job.findMany({
      where: { employerId: person.id, status: "OPEN" },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true } },
        employer: { select: { id: true, name: true, district: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return res.status(200).json({
    success: true,
    person: serialize({ ...shapePerson(person), phone: shop?.phone || person.phone, whatsapp: shop?.whatsapp || null }),
    listings: serialize(listings),
    jobs: serialize(jobs),
  });
});

function shapePerson(user) {
  const shop = user.shops?.[0] || null;

  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    district: user.district,
    headline: user.headline || (shop ? shop.name : null),
    bio: user.bio,
    skills: user.skills || [],
    role: user.role,
    createdAt: user.createdAt,
    shop,
    openJobs: user._count?.jobs ?? 0,
    views: user.views ?? 0,
    connections: user._count?.connectionsAsSeller ?? 0,
    kind: shop ? "seller" : "specialist",
  };
}
