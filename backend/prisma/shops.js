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

  // Added from the LOCO team's shop lists (no phone numbers supplied yet).
  {
    name: "Golden Fashion",
    slug: "golden-fashion",
    kind: "Clothing shop",
    phone: null,
    district: "Nyarugenge",
    description: "Clothing shop in Kigali.",
  },
  {
    name: "Vivo Fashion Group",
    slug: "vivo-fashion-group",
    kind: "Fashion store",
    phone: null,
    district: "Nyarugenge",
    description: "Fashion store in Kigali.",
  },
  {
    name: "Bossini",
    slug: "bossini",
    kind: "Clothing brand store",
    phone: null,
    district: "Nyarugenge",
    description: "Clothing brand store in Kigali.",
  },
  {
    name: "Kigali Latest Fashion",
    slug: "kigali-latest-fashion",
    kind: "Clothing shop",
    phone: null,
    district: "Nyarugenge",
    description: "Clothing shop in Kigali.",
  },
  {
    name: "Cunda Fashion House",
    slug: "cunda-fashion-house",
    kind: "Fashion house",
    phone: null,
    district: "Nyarugenge",
    description: "Fashion house in Kigali.",
  },
  {
    name: "Suit and Tie Fashion Shop",
    slug: "suit-and-tie-fashion-shop",
    kind: "Men's suits and formal wear",
    phone: null,
    district: "Nyarugenge",
    description: "Men's suits and formal wear in Kigali.",
  },
  {
    name: "Kush Women's Fashion Store",
    slug: "kush-womens-fashion-store",
    kind: "Women's fashion",
    phone: null,
    district: "Nyarugenge",
    description: "Women's fashion in Kigali.",
  },
  {
    name: "Sheja Clothing",
    slug: "sheja-clothing",
    kind: "Clothing brand",
    phone: null,
    district: "Nyarugenge",
    description: "Clothing brand in Kigali.",
  },
  {
    name: "New Kigali Designers & Outfitters",
    slug: "new-kigali-designers-and-outfitters",
    kind: "Tailoring and outfitters",
    phone: null,
    district: "Nyarugenge",
    description: "Tailoring and outfitters in Kigali.",
  },
  {
    name: "Flove Rwanda",
    slug: "flove-rwanda",
    kind: "Fashion and accessories",
    phone: null,
    district: "Nyarugenge",
    description: "Fashion and accessories in Kigali.",
  },
  {
    name: "Golden Ring Jewelry Rwanda",
    slug: "golden-ring-jewelry-rwanda",
    kind: "Jewellery",
    phone: null,
    district: "Nyarugenge",
    description: "Jewellery in Kigali.",
  },
  {
    name: "SportsLand",
    slug: "sportsland",
    kind: "Sportswear and equipment",
    phone: null,
    district: "Nyarugenge",
    description: "Sportswear and equipment in Kigali.",
  },
  {
    name: "Hope Line Sports",
    slug: "hope-line-sports",
    kind: "Sportswear and equipment",
    phone: null,
    district: "Nyarugenge",
    description: "Sportswear and equipment in Kigali.",
  },
  {
    name: "WAMA Center",
    slug: "wama-center",
    kind: "Fashion and shopping centre",
    phone: null,
    district: "Nyarugenge",
    description: "Fashion and shopping centre in Kigali.",
  },
  {
    name: "Her Majesty Cosmetics",
    slug: "her-majesty-cosmetics",
    kind: "Cosmetics shop",
    phone: null,
    district: "Nyarugenge",
    description: "Cosmetics shop in Kigali.",
  },
  {
    name: "Goodlife Health & Beauty",
    slug: "goodlife-health-and-beauty",
    kind: "Health and beauty store",
    phone: null,
    district: "Nyarugenge",
    description: "Health and beauty store in Kigali.",
  },
  {
    name: "Bold Beauty Cosmetics",
    slug: "bold-beauty-cosmetics",
    kind: "Cosmetics shop",
    phone: null,
    district: "Nyarugenge",
    description: "Cosmetics shop in Kigali.",
  },
  {
    name: "Beauty To The Max",
    slug: "beauty-to-the-max",
    kind: "Cosmetics shop",
    phone: null,
    district: "Nyarugenge",
    description: "Cosmetics shop in Kigali.",
  },
  {
    name: "Glitz Nails and Beauty",
    slug: "glitz-nails-and-beauty",
    kind: "Nail and beauty salon",
    phone: null,
    district: "Nyarugenge",
    description: "Nail and beauty salon in Kigali.",
  },
  {
    name: "Posh Salon & Spa",
    slug: "posh-salon-and-spa",
    kind: "Salon and spa",
    phone: null,
    district: "Nyarugenge",
    description: "Salon and spa in Kigali.",
  },
  {
    name: "Classic Bijouterie",
    slug: "classic-bijouterie",
    kind: "Jewellery and accessories",
    phone: null,
    district: "Nyarugenge",
    description: "Jewellery and accessories in Kigali.",
  },
  {
    name: "Rubia Coffee Roasters Rwanda",
    slug: "rubia-coffee-roasters-rwanda",
    kind: "Coffee roaster",
    phone: null,
    district: "Nyarugenge",
    description: "Coffee roaster in Kigali.",
  },
  {
    name: "Platinum Salon & Beauty Spa",
    slug: "platinum-salon-and-beauty-spa",
    kind: "Salon and spa",
    phone: null,
    district: "Nyarugenge",
    description: "Salon and spa in Kigali.",
  },
  {
    name: "ILBA Hair",
    slug: "ilba-hair",
    kind: "Hair products and salon",
    phone: null,
    district: "Nyarugenge",
    description: "Hair products and salon in Kigali.",
  },
  {
    name: "Danube Home Kigali",
    slug: "danube-home-kigali",
    kind: "Furniture and home decor",
    phone: null,
    district: "Nyarugenge",
    description: "Furniture and home decor in Kigali.",
  },
  {
    name: "RwandaFoam",
    slug: "rwandafoam",
    kind: "Mattresses and foam products",
    phone: null,
    district: "Nyarugenge",
    description: "Mattresses and foam products in Kigali.",
  },
  {
    name: "Davis & Shirtliff",
    slug: "davis-and-shirtliff",
    kind: "Water pumps, solar and hardware",
    phone: null,
    district: "Nyarugenge",
    description: "Water pumps, solar and hardware in Kigali.",
  },
  {
    name: "Africa Glassware",
    slug: "africa-glassware",
    kind: "Glassware and kitchenware",
    phone: null,
    district: "Nyarugenge",
    description: "Glassware and kitchenware in Kigali.",
  },
  {
    name: "ELOHOME",
    slug: "elohome",
    kind: "Home appliances and furniture",
    phone: null,
    district: "Nyarugenge",
    description: "Home appliances and furniture in Kigali.",
  },
  {
    name: "AA & Stainless Hardware",
    slug: "aa-and-stainless-hardware",
    kind: "Hardware store",
    phone: null,
    district: "Nyarugenge",
    description: "Hardware store in Kigali.",
  },
  {
    name: "Bricotech Hardware",
    slug: "bricotech-hardware",
    kind: "Hardware store",
    phone: null,
    district: "Nyarugenge",
    description: "Hardware store in Kigali.",
  },
  {
    name: "Total Tools and Hardware Store",
    slug: "total-tools-and-hardware-store",
    kind: "Tools and hardware",
    phone: null,
    district: "Nyarugenge",
    description: "Tools and hardware in Kigali.",
  },
  {
    name: "Solid Hardware",
    slug: "solid-hardware",
    kind: "Hardware store",
    phone: null,
    district: "Nyarugenge",
    description: "Hardware store in Kigali.",
  },
  {
    name: "Nappyhood Natural Hair Salon & Products",
    slug: "nappyhood-natural-hair-salon-and-products",
    kind: "Natural hair salon and products",
    phone: null,
    district: "Nyarugenge",
    description: "Natural hair salon and products in Kigali.",
  },
  {
    name: "Isaac's Baby Store",
    slug: "isaacs-baby-store",
    kind: "Baby products",
    phone: null,
    district: "Nyarugenge",
    description: "Baby products in Kigali.",
  },
  {
    name: "NappyHood",
    slug: "nappyhood",
    kind: "Natural hair products",
    phone: null,
    district: "Nyarugenge",
    description: "Natural hair products in Kigali.",
  },
  {
    name: "HoodMart Supermarket",
    slug: "hoodmart-supermarket",
    kind: "Supermarket",
    phone: null,
    district: "Nyarugenge",
    description: "Supermarket in Kigali.",
  },
  {
    name: "German Butchery",
    slug: "german-butchery",
    kind: "Butchery and deli",
    phone: null,
    district: "Nyarugenge",
    description: "Butchery and deli in Kigali.",
  },
  {
    name: "The Women's Bakery",
    slug: "the-womens-bakery",
    kind: "Bakery",
    phone: null,
    district: "Nyarugenge",
    description: "Bakery in Kigali.",
  },
  {
    name: "Boho Bakery",
    slug: "boho-bakery",
    kind: "Bakery",
    phone: null,
    district: "Nyarugenge",
    description: "Bakery in Kigali.",
  },
  {
    name: "Brioche Kacyiru",
    slug: "brioche-kacyiru",
    kind: "Bakery and café",
    phone: null,
    district: "Gasabo",
    sector: "Kacyiru",
    description: "Bakery and café in Kigali.",
  },
  {
    name: "Panera Bakery",
    slug: "panera-bakery",
    kind: "Bakery",
    phone: null,
    district: "Nyarugenge",
    description: "Bakery in Kigali.",
  },
  {
    name: "Royal Pastry Empire",
    slug: "royal-pastry-empire",
    kind: "Pastry shop",
    phone: null,
    district: "Nyarugenge",
    description: "Pastry shop in Kigali.",
  },
  {
    name: "Mukamira Dairy",
    slug: "mukamira-dairy",
    kind: "Dairy products",
    phone: null,
    district: "Nyarugenge",
    description: "Dairy products in Kigali.",
  },
  {
    name: "Inyange Milk Zone",
    slug: "inyange-milk-zone",
    kind: "Milk and dairy outlet",
    phone: null,
    district: "Nyarugenge",
    description: "Milk and dairy outlet in Kigali.",
  },
  {
    name: "Fresh Dairy",
    slug: "fresh-dairy",
    kind: "Dairy products",
    phone: null,
    district: "Nyarugenge",
    description: "Dairy products in Kigali.",
  },
  {
    name: "Kivu Noir",
    slug: "kivu-noir",
    kind: "Rwandan coffee",
    phone: null,
    district: "Nyarugenge",
    description: "Rwandan coffee in Kigali.",
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
