// Real Kigali shops added by the LOCO team. Idempotent: a shop is created
// only when no shop with its slug exists, so edits made in the admin panel
// are never overwritten. Each shop gets a placeholder seller account
// (<slug>@shops.loco.rw) that the real owner can take over later.
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrl } from "../src/config/database-url.js";
import { normalizePhone } from "../src/constants/rwanda.js";
import { storeImage } from "./demo-images.js";

// Cover (<slug>.jpg, 480x360) and optional logo (<slug>-logo.jpg, 256x256).
// Brand marks were taken from the shops' own websites; the others use the
// category photos. Owners can replace them from their seller portal.
const IMAGE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "shop-images");

function bundledImage(file) {
  const full = path.join(IMAGE_DIR, file);
  return existsSync(full) ? readFileSync(full) : null;
}

const prisma = new PrismaClient({ datasourceUrl: applyDatabaseUrl() || undefined });

const SHOPS = [
  // Supermarkets
  {
    name: "Simba Supermarket",
    slug: "simba-supermarket",
    kind: "Supermarket",
    phone: "+250 788 307 200",
    whatsapp: "+250 791 345 196",
    district: "Gasabo",
    sector: "Kimihurura",
    description: "Supermarket chain with groceries, drinks, household goods and fresh food. General contact +250 788 307 200, WhatsApp +250 791 345 196.",
  },
  {
    name: "Sawa Citi Supermarket",
    slug: "sawa-citi-supermarket",
    kind: "Supermarket",
    phone: "+250 788 316 000",
    district: "Nyarugenge",
    sector: "Nyarugenge",
    description: "Supermarket with groceries, drinks, household items and more.",
  },
  {
    name: "2000 Supermarket (T2000)",
    slug: "t2000-supermarket",
    kind: "Supermarket",
    // The number supplied (+250 784 793 30) is one digit short; add it in the admin panel.
    phone: null,
    district: "Nyarugenge",
    sector: "Nyarugenge",
    description: "Supermarket in Kigali city centre with groceries, drinks and household goods.",
  },
  {
    name: "Deluxe Trading Supermarket",
    slug: "deluxe-trading-supermarket",
    kind: "Supermarket",
    phone: "+250 785 795 277",
    district: "Nyarugenge",
    description: "Supermarket with groceries, drinks and household goods.",
  },
  {
    name: "Sharma Supermarket",
    slug: "sharma-supermarket",
    kind: "Supermarket",
    phone: "+250 788 442 279",
    district: "Nyarugenge",
    description: "Supermarket with groceries, imported foods, drinks and household goods.",
  },
  {
    name: "Patel Grocers",
    slug: "patel-grocers",
    kind: "Grocery store",
    phone: "+250 783 335 971",
    district: "Nyarugenge",
    description: "Grocery store with everyday food items, spices and household goods.",
  },

  // Electronics
  {
    name: "Homepoint Rwanda",
    slug: "homepoint-rwanda",
    kind: "Electronics and home appliances",
    phone: "+250 788 381 818",
    whatsapp: "+250 788 381 774",
    district: "Nyarugenge",
    sector: "Nyarugenge",
    address: "Kigali Innovation City (KIC) showroom",
    description: "Electronics and home appliances. Showrooms: KIC +250 788 381 818, Remera +250 788 381 710, Kicukiro +250 788 381 714. WhatsApp +250 788 381 774.",
  },
  {
    name: "New Modern Technologies Rwanda",
    slug: "new-modern-technologies-rwanda",
    kind: "Electronics",
    phone: "+250 788 941 006",
    whatsapp: "+250 788 941 006",
    district: "Nyarugenge",
    sector: "Nyarugenge",
    address: "Kigali City Tower",
    description: "Phones, computers and electronics at Kigali City Tower.",
  },
  {
    name: "Smart Dot Electronics",
    slug: "smart-dot-electronics",
    kind: "Electronics",
    phone: "+250 785 657 398",
    whatsapp: "+250 785 657 398",
    district: "Nyarugenge",
    description: "Phones, accessories and electronics.",
  },
  {
    name: "Biriho Shop",
    slug: "biriho-shop",
    kind: "Electronics",
    phone: "+250 788 200 521",
    whatsapp: "+250 788 200 521",
    district: "Nyarugenge",
    description: "Electronics and accessories.",
  },
  {
    name: "Tajyire Electronics",
    slug: "tajyire-electronics",
    kind: "Electronics",
    phone: "+250 789 230 060",
    district: "Nyarugenge",
    sector: "Nyarugenge",
    address: "KN 84 Street",
    description: "Electronics shop on KN 84 Street.",
  },
  {
    name: "Roots Rwanda Ltd",
    slug: "roots-rwanda",
    kind: "Electronics",
    phone: "+250 781 308 888",
    district: "Nyarugenge",
    description: "Electronics and appliances. Alternative number +250 733 308 888.",
  },
  {
    name: "Galaxy Hub",
    slug: "galaxy-hub",
    kind: "Electronics",
    phone: "+250 785 288 910",
    district: "Nyarugenge",
    description: "Phones, gadgets and electronics.",
  },
  {
    name: "Delta Tech",
    slug: "delta-tech",
    kind: "Electronics",
    phone: "+250 784 001 835",
    whatsapp: "+250 784 001 835",
    district: "Nyarugenge",
    description: "Computers, phones and tech accessories.",
  },
];

// Gives a shop its bundled cover and logo when it has none yet.
async function seedShopImages(db, shop) {
  const data = {};

  if (!shop.coverUrl) {
    const buffer = bundledImage(`${shop.slug}.jpg`);
    if (buffer) data.coverUrl = await storeImage(db, { buffer, mime: "image/jpeg", width: 480, height: 360 }, shop.ownerId);
  }
  if (!shop.logoUrl) {
    const buffer = bundledImage(`${shop.slug}-logo.jpg`);
    if (buffer) data.logoUrl = await storeImage(db, { buffer, mime: "image/jpeg", width: 256, height: 256 }, shop.ownerId);
  }

  if (Object.keys(data).length) {
    await db.shop.update({ where: { id: shop.id }, data });
    return true;
  }
  return false;
}

export async function seedShops(db = prisma) {
  let created = 0;
  let pictured = 0;

  for (const entry of SHOPS) {
    const existing = await db.shop.findUnique({
      where: { slug: entry.slug },
      select: { id: true, slug: true, ownerId: true, coverUrl: true, logoUrl: true },
    });
    if (existing) {
      if (await seedShopImages(db, existing)) pictured += 1;
      continue;
    }

    const email = `${entry.slug}@shops.loco.rw`;
    const owner = await db.user.upsert({
      where: { email },
      update: {},
      create: {
        name: entry.name,
        email,
        passwordHash: await bcrypt.hash(randomBytes(24).toString("base64url"), 12),
        role: "SELLER",
        district: entry.district,
        headline: `${entry.kind} in ${entry.sector || entry.district}`,
        emailVerified: true,
      },
      select: { id: true },
    });

    const shop = await db.shop.create({
      select: { id: true, slug: true, ownerId: true, coverUrl: true, logoUrl: true },
      data: {
        name: entry.name,
        slug: entry.slug,
        description: entry.description,
        phone: normalizePhone(entry.phone),
        whatsapp: normalizePhone(entry.whatsapp),
        city: entry.district,
        district: entry.district,
        sector: entry.sector || null,
        address: entry.address || null,
        verified: true,
        ownerId: owner.id,
      },
    });
    created += 1;
    if (await seedShopImages(db, shop)) pictured += 1;
  }

  console.log(`Real shops ready: ${SHOPS.length} listed, ${created} created, ${pictured} given images.`);
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  seedShops()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
