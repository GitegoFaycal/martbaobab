// Nationwide showcase data: one shop with products in every village of Rwanda,
// a specialist in every second village and an open job in every fourth, all
// placed at their cell's centre with a small offset. Idempotent and resumable
// (createMany with skipDuplicates). Accounts use the @village.loco.rw domain
// so they can be told apart and removed: `node prisma/villages.js --remove`.
// SEED_VILLAGES=false skips it; DEMO_WHATSAPP routes every demo WhatsApp
// button to one number for stakeholder demos.
import "dotenv/config";
import { createRequire } from "node:module";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrl } from "../src/config/database-url.js";
import { normalizePhone } from "../src/constants/rwanda.js";
import { placeCentre } from "../src/services/geo.service.js";
import { slugify } from "../src/utils/helpers.js";

const require = createRequire(import.meta.url);
const TREE = require("../src/data/rwanda-locations.json");

const prisma = new PrismaClient({ datasourceUrl: applyDatabaseUrl() || undefined });
const DOMAIN = "village.loco.rw";
const WEB = (process.env.PUBLIC_WEB_URL || "https://martbaobab-frontend.vercel.app").replace(/\/$/, "");
const DEMO_WHATSAPP = normalizePhone(process.env.DEMO_WHATSAPP || "");
const BATCH = 1500;

// ---------- deterministic randomness ----------
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const pick = (r, list) => list[Math.floor(r() * list.length)];
const between = (r, a, b) => a + Math.floor(r() * (b - a + 1));

// ---------- names ----------
const FIRST = ["Jean", "Marie", "Eric", "Claudine", "Emmanuel", "Josiane", "Patrick", "Alice", "Olivier", "Diane", "Innocent", "Sandrine", "Fabrice", "Aline", "Theogene", "Yvonne", "Didier", "Grace", "Samuel", "Immaculee", "Gilbert", "Beatrice", "Pascal", "Chantal", "Fidele", "Jeannette", "Bosco", "Clarisse", "Aimable", "Solange", "Alphonse", "Divine", "Vincent", "Peace", "Kevin", "Liliane", "Yves", "Ange", "Moses", "Esperance"];
const LAST = ["Mugisha", "Uwase", "Niyonzima", "Mukamana", "Habimana", "Ingabire", "Nshimiyimana", "Uwimana", "Hakizimana", "Mutesi", "Ndayisaba", "Umutoni", "Bizimana", "Ishimwe", "Nsabimana", "Uwera", "Twagirayezu", "Kamikazi", "Nkurunziza", "Mukeshimana", "Iradukunda", "Nyirahabimana", "Rukundo", "Keza", "Gatete", "Umuhoza", "Manzi", "Ineza", "Niyigena", "Uwizeye", "Munyaneza", "Mukandayisenga", "Habyarimana", "Nyiransabimana", "Tuyishime", "Uwamahoro", "Ntwari", "Mushimiyimana", "Rugamba", "Nyiraneza"];

// ---------- shop blueprints ----------
// products: [name, price, unit, condition, originalPrice]
const SHOP_TYPES = [
  { kind: "Alimentation", name: (f, l, v) => `Alimentation ${v}`, headline: "Grocery shop", category: "food-groceries", products: [["Sugar 1kg", 1500, "kg"], ["Cooking oil 1L", 3200, "bottle"], ["Rice 5kg", 7500, "bag"], ["Inyange milk 1L", 1200, "bottle"], ["Bar soap", 600, "piece"], ["Maize flour 5kg", 4500, "bag"], ["Salt 1kg", 500, "kg"], ["Bread", 800, "loaf"], ["Fanta 500ml", 700, "bottle"], ["Airtime bundle", 1000, "card"], ["Charcoal sack", 14000, "sack"], ["Cooking gas 12kg refill", 15500, "refill"]] },
  { kind: "Boutique", name: (f, l) => `${l} Boutique`, headline: "Clothing and shoes", category: "clothing-shoes", products: [["Kitenge dress (made to measure)", 12000, "piece"], ["Men's shirt", 8000, "piece"], ["Jeans", 15000, "pair"], ["Sandals", 4500, "pair"], ["School uniform set", 18000, "set"], ["Sports shoes", 25000, "pair"], ["Baby clothes set", 9000, "set"]] },
  { kind: "Hardware", name: (f, l, v) => `${v} Hardware`, headline: "Building materials and tools", category: "building-materials", products: [["Cement 50kg (CIMERWA)", 13500, "bag"], ["Iron sheet 28 gauge (3m)", 11000, "sheet"], ["Nails 1kg", 2500, "kg"], ["Hoe", 6000, "piece"], ["Paint 20L white (Sadolin)", 68000, "bucket"], ["Wheelbarrow", 45000, "piece"], ["PVC pipe 3m", 6500, "piece"]] },
  { kind: "Phone shop", name: (f, l) => `${l} Phone Shop`, headline: "Phones, airtime and accessories", category: "phones-electronics", products: [["Phone charger type-C", 4500, "piece"], ["Earphones", 3500, "pair"], ["Tecno Spark 20 (used, 128GB)", 95000, "piece", "USED", 145000], ["Power bank 10,000mAh", 12000, "piece"], ["SIM card and airtime", 1000, "card"], ["Solar lamp with phone charging", 9500, "piece"], ["Itel keypad phone", 18000, "piece"]] },
  { kind: "Salon", name: (f) => `${f} Salon`, headline: "Hair salon and barber", category: "salon-barber", service: true, products: [["Haircut", 2000, "visit"], ["Braids", 8000, "visit"], ["Manicure and pedicure", 3000, "visit"], ["Hair relaxing", 6000, "visit"], ["Beard trim", 1500, "visit"]] },
  { kind: "Fresh market", name: (f, l, v) => `${v} Fresh Market`, headline: "Fresh produce from local farms", category: "fresh-produce", products: [["Tomatoes 1kg", 1200, "kg"], ["Irish potatoes 10kg", 6500, "bag"], ["Bananas (bunch)", 3000, "bunch"], ["Avocados (5 pieces)", 1500, "pack"], ["Eggs (tray of 30)", 4500, "tray"], ["Cabbage", 500, "piece"], ["Dry beans 1kg", 1300, "kg"], ["Passion fruit 1kg", 2000, "kg"]] },
  { kind: "Second-hand store", name: (f, l) => `${l} Second-hand`, headline: "Good-as-new items at low prices", category: "furniture", products: [["Sofa set (used)", 120000, "set", "USED", 250000], ["Bicycle (used)", 45000, "piece", "USED", 90000], ["Mattress 1.5m (used)", 25000, "piece", "USED", 60000], ["Wooden table (used)", 18000, "piece", "USED", 40000], ["Laptop HP (used)", 180000, "piece", "USED", 350000], ["Jeans (used)", 5000, "pair", "USED", 15000]] },
  { kind: "Moto & delivery", name: (f, l) => `${f} Moto Services`, headline: "Moto rides and parcel delivery", category: "moto-delivery", service: true, products: [["Moto ride within the village", 500, "ride"], ["Ride to the sector office", 1000, "ride"], ["Parcel delivery", 1500, "delivery"], ["Market shopping run", 2000, "errand"]] },
  { kind: "Home & kitchen", name: (f, l) => `${l} Home Store`, headline: "Kitchenware and household goods", category: "home-kitchen", products: [["Saucepan set (5 pieces)", 22000, "set"], ["Plastic chairs (set of 4)", 16000, "set"], ["Jerrycan 20L", 2500, "piece"], ["Thermos flask", 7500, "piece"], ["Mosquito net", 6000, "piece"], ["Bucket 20L", 2000, "piece"]] },
  { kind: "Beauty shop", name: (f) => `${f} Beauty Shop`, headline: "Cosmetics and personal care", category: "beauty-care", products: [["Body lotion 400ml", 3500, "bottle"], ["Vaseline 250ml", 2500, "jar"], ["Hair oil", 3000, "bottle"], ["Perfume", 9000, "bottle"], ["Toothpaste 100ml", 1500, "tube"]] },
];

// Products that have a better photo than their category.
const PRODUCT_PHOTO = { "Cooking gas 12kg refill": "gas-charcoal", "Charcoal sack": "gas-charcoal", "Fanta 500ml": "drinks-water", "Inyange milk 1L": "drinks-water", "Baby clothes set": "baby-kids", "Laptop HP (used)": "phones-electronics", "Bicycle (used)": "motorbikes-bicycles", "Jeans (used)": "clothing-shoes" };

const SPECIALISTS = [
  ["Mason", "Mason and brick layer", ["masonry", "plastering", "tiling"], "skilled-trades"],
  ["Electrician", "Electrician and solar installer", ["wiring", "solar", "repairs"], "plumbing-electrical"],
  ["Tailor", "Tailor, kitenge and school uniforms", ["sewing", "kitenge", "uniforms"], "tailoring"],
  ["Plumber", "Plumber and water tank installer", ["plumbing", "tanks", "pipes"], "plumbing-electrical"],
  ["Carpenter", "Carpenter: doors, beds and tables", ["carpentry", "furniture"], "skilled-trades"],
  ["Driver", "Driver with own motorbike", ["moto", "delivery", "transport"], "driver-rider"],
  ["Cook", "Cook for events and households", ["cooking", "catering"], "catering-events"],
  ["Tutor", "Primary school tutor, maths and English", ["tutoring", "maths", "english"], "tutoring-training"],
  ["Mechanic", "Moto and bicycle mechanic", ["mechanics", "repairs"], "mechanics"],
  ["Farmer", "Farmer selling seedlings and manure", ["farming", "seedlings"], "farming"],
  ["Welder", "Welder: gates, windows and grills", ["welding", "gates"], "skilled-trades"],
  ["Cleaner", "House cleaning and laundry", ["cleaning", "laundry"], "cleaning-laundry"],
];

// [title, category slug, jobType, payPeriod, payMin, payMax, workers, description]
const JOBS = [
  ["Workers for a building site in {v}", "construction", "DAILY", "PER_DAY", 3000, 5000, 6, "Mixing mortar, carrying bricks and helping the masons. Start at 7am. Lunch provided."],
  ["Farm hands for the harvest in {v}", "farming", "DAILY", "PER_DAY", 2500, 3500, 10, "Harvesting beans and potatoes for one week. Bring your own hoe if you have one."],
  ["House help needed in {v}", "house-help", "FULL_TIME", "PER_MONTH", 40000, 60000, 1, "Cooking, cleaning and looking after two children. Live-in possible."],
  ["Shop attendant for a kiosk in {v}", "shop-restaurant", "FULL_TIME", "PER_MONTH", 50000, 70000, 1, "Serve customers, keep records in a notebook and restock. Must be honest and good with people."],
  ["Night security guard in {v}", "security", "FULL_TIME", "PER_MONTH", 45000, 55000, 2, "Guard a residential compound from 6pm to 6am, alternate nights."],
  ["Moto driver with own motorbike, {v}", "driver-rider", "CONTRACT", "PER_DAY", 4000, 6000, 1, "Deliver parcels and ride customers around the sector. Paid per day plus fuel."],
  ["Porters to unload a truck in {v}", "loading-porter", "DAILY", "PER_TASK", 4000, 6000, 5, "Unload cement and iron sheets on Saturday morning. About four hours."],
  ["Cleaner for a small guesthouse in {v}", "cleaning-gardening", "PART_TIME", "PER_WEEK", 10000, 15000, 1, "Clean rooms and the yard three mornings a week."],
  ["Tailor assistant in {v}", "skilled-trades", "FULL_TIME", "PER_MONTH", 45000, 65000, 1, "Help with cutting and finishing kitenge orders. Experience with a sewing machine needed."],
  ["Sales agent for mobile money in {v}", "office-sales", "FULL_TIME", "PER_MONTH", 55000, 80000, 2, "Serve MoMo and Airtel Money customers, sell SIM cards. Commission on top."],
];

// ---------- helpers ----------
function villages() {
  const out = [];
  for (const [province, districts] of Object.entries(TREE)) {
    for (const [district, sectors] of Object.entries(districts)) {
      for (const [sector, cells] of Object.entries(sectors)) {
        for (const [cell, names] of Object.entries(cells)) {
          for (const village of names) out.push({ province, district, sector, cell, village });
        }
      }
    }
  }
  return out;
}

function phoneFor(n) {
  // 0780xxxxxx .. valid pattern, sequential, clearly a demo block
  const prefix = ["078", "079", "072", "073"][n % 4];
  return normalizePhone(`${prefix}0${String(100000 + n).slice(-6)}`);
}

function imageUrl(categorySlug) {
  return `${WEB}/categories/${categorySlug}.jpg`;
}

function avatarUrl(name) {
  const params = new URLSearchParams({ seed: name, backgroundColor: "eef4ff,d6e6ff,d2f3fc", radius: "50", skinColor: "763900,9e5622", hairColor: "0e0e0e,562306,6a4e35" });
  return `https://api.dicebear.com/9.x/adventurer/svg?${params}`;
}

async function inBatches(rows, fn) {
  for (let i = 0; i < rows.length; i += BATCH) await fn(rows.slice(i, i + BATCH));
}

function daysAgo(r, max) {
  return new Date(Date.now() - Math.floor(r() * max) * 86400000 - Math.floor(r() * 86400000));
}

// ---------- main ----------
async function repairPhotoHosts() {
  const prefix = `${WEB}/categories/`;
  const shops = await prisma.$executeRawUnsafe(
    `UPDATE "Shop" SET "coverUrl" = $1 || substring("coverUrl" from position('/categories/' in "coverUrl") + 12) WHERE "coverUrl" LIKE '%/categories/%' AND "coverUrl" NOT LIKE $2`,
    prefix, `${prefix}%`
  );
  const images = await prisma.$executeRawUnsafe(
    `UPDATE "ListingImage" SET url = $1 || substring(url from position('/categories/' in url) + 12) WHERE url LIKE '%/categories/%' AND url NOT LIKE $2`,
    prefix, `${prefix}%`
  );
  if (shops || images) console.log(`Repaired photo links: ${shops} shop covers, ${images} product photos -> ${WEB}`);
}

export async function seedVillages() {
  await repairPhotoHosts();
  const all = villages();
  const planned = all.length + Math.floor(all.length / 2); // owners + specialists
  const existing = await prisma.user.count({ where: { email: { endsWith: `@${DOMAIN}` } } });
  if (existing >= planned) {
    console.log(`Village showcase already present (${existing} accounts).`);
    return;
  }
  console.log(`Seeding village showcase: ${all.length} villages (${existing} accounts so far)...`);

  const categories = Object.fromEntries((await prisma.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]));
  const passwordHash = await bcrypt.hash("Village2026!", 10);

  // 1. People: an owner per village, a specialist every second village.
  const users = [];
  const plan = [];
  all.forEach((place, i) => {
    const r = rng(i * 7919 + 17);
    const first = pick(r, FIRST);
    const last = pick(r, LAST);
    const centre = placeCentre({ district: place.district, sector: place.sector, cell: place.cell }) || placeCentre({ district: place.district });
    const jitter = () => (r() - 0.5) * 0.006; // about +-300 m
    const lat = centre ? +(centre.lat + jitter()).toFixed(6) : null;
    const lng = centre ? +(centre.lng + jitter()).toFixed(6) : null;
    const type = SHOP_TYPES[i % SHOP_TYPES.length];
    const ownerEmail = `owner${i}@${DOMAIN}`;
    const ownerName = `${first} ${last}`;
    users.push({ name: ownerName, email: ownerEmail, phone: phoneFor(i), passwordHash, role: "SELLER", district: place.district, sector: place.sector, cell: place.cell, village: place.village, lat, lng, headline: `${type.headline} in ${place.village}`, avatarUrl: avatarUrl(ownerName), views: between(r, 15, 600), emailVerified: true, createdAt: daysAgo(r, 90) });
    const entry = { i, place, r, first, last, lat, lng, type, ownerEmail, ownerName };
    if (i % 2 === 1) {
      const sp = SPECIALISTS[Math.floor(i / 2) % SPECIALISTS.length];
      const sFirst = pick(r, FIRST);
      const sLast = pick(r, LAST);
      const name = `${sFirst} ${sLast}`;
      users.push({ name, email: `spec${i}@${DOMAIN}`, phone: phoneFor(100000 + i), passwordHash, role: "CUSTOMER", district: place.district, sector: place.sector, cell: place.cell, village: place.village, lat: lat != null ? +(lat + jitter()).toFixed(6) : null, lng: lng != null ? +(lng + jitter()).toFixed(6) : null, headline: `${sp[1]} in ${place.village}`, bio: `${sp[0]} based in ${place.village}, ${place.sector}. Available in ${place.district} and nearby sectors. Call or WhatsApp to agree a price.`, skills: sp[2], avatarUrl: avatarUrl(name), views: between(r, 10, 400), emailVerified: true, createdAt: daysAgo(r, 90) });
      entry.specialistEmail = `spec${i}@${DOMAIN}`;
      entry.specialist = sp;
    }
    plan.push(entry);
  });
  await inBatches(users, (rows) => prisma.user.createMany({ data: rows, skipDuplicates: true }));
  console.log(`  people: ${users.length}`);

  const idByEmail = new Map();
  await inBatches(users.map((u) => u.email), async (emails) => {
    const found = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true, email: true } });
    for (const u of found) idByEmail.set(u.email, u.id);
  });

  // 2. Shops.
  const shops = plan.map((e) => {
    const name = e.type.name(e.first, e.last, e.place.village);
    return {
      name,
      slug: `${slugify(name)}-${slugify(e.place.cell)}-${e.i}`,
      description: `${e.type.headline} serving ${e.place.village} and the rest of ${e.place.cell} cell, ${e.place.sector}. Open every day. Message us on WhatsApp and collect in the shop or ask for moto delivery.`,
      phone: phoneFor(e.i),
      whatsapp: DEMO_WHATSAPP || phoneFor(e.i),
      city: e.place.district,
      district: e.place.district,
      sector: e.place.sector,
      cell: e.place.cell,
      village: e.place.village,
      lat: e.lat,
      lng: e.lng,
      coverUrl: imageUrl(e.type.category),
      verified: e.r() < 0.4,
      ownerId: idByEmail.get(e.ownerEmail),
      createdAt: daysAgo(e.r, 90),
    };
  }).filter((s) => s.ownerId);
  await inBatches(shops, (rows) => prisma.shop.createMany({ data: rows, skipDuplicates: true }));
  console.log(`  shops: ${shops.length}`);

  const shopIdBySlug = new Map();
  await inBatches(shops.map((s) => s.slug), async (slugs) => {
    const found = await prisma.shop.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
    for (const s of found) shopIdBySlug.set(s.slug, s.id);
  });

  // 3. Products: three or four per shop.
  const listings = [];
  plan.forEach((e, idx) => {
    const shopId = shopIdBySlug.get(shops[idx]?.slug);
    if (!shopId) return;
    const count = between(e.r, 3, 4);
    const start = Math.floor(e.r() * e.type.products.length);
    for (let k = 0; k < count; k += 1) {
      const [pname, price, unit, condition = "NEW", original] = e.type.products[(start + k) % e.type.products.length];
      const categoryId = categories[e.type.category];
      if (!categoryId) continue;
      listings.push({
        name: pname,
        slug: `${slugify(pname)}-${slugify(e.place.village)}-${e.i}-${k}`,
        description: `${pname} available now at ${shops[idx].name} in ${e.place.village}. Price in RWF, ${unit ? `per ${unit}` : ""}. Message the shop on WhatsApp to reserve.`,
        type: e.type.service ? "SERVICE" : "PRODUCT",
        condition,
        price,
        originalPrice: original ?? null,
        unit,
        negotiable: e.r() < 0.35,
        stock: e.type.service ? null : between(e.r, 3, 60),
        district: e.place.district,
        views: between(e.r, 5, 300),
        categoryId,
        shopId,
        active: true,
        createdAt: daysAgo(e.r, 60),
        _photo: PRODUCT_PHOTO[pname] || e.type.category,
      });
    }
  });
  await inBatches(listings, (rows) => prisma.listing.createMany({ data: rows.map(({ _photo, ...row }) => row), skipDuplicates: true }));
  console.log(`  products and services: ${listings.length}`);

  const listingIdBySlug = new Map();
  await inBatches(listings.map((l) => l.slug), async (slugs) => {
    const found = await prisma.listing.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
    for (const l of found) listingIdBySlug.set(l.slug, l.id);
  });
  const withImage = new Set((await prisma.listingImage.findMany({ where: { listingId: { in: [...listingIdBySlug.values()] } }, select: { listingId: true } })).map((x) => x.listingId));
  const images = listings.filter((l) => listingIdBySlug.has(l.slug) && !withImage.has(listingIdBySlug.get(l.slug))).map((l) => ({ listingId: listingIdBySlug.get(l.slug), url: imageUrl(l._photo), position: 0, alt: l.name }));
  await inBatches(images, (rows) => prisma.listingImage.createMany({ data: rows }));
  console.log(`  photos: ${images.length}`);

  // 4. Jobs: every fourth village, posted by the shop owner.
  const jobs = [];
  plan.forEach((e) => {
    if (e.i % 4 !== 0) return;
    const j = JOBS[Math.floor(e.i / 4) % JOBS.length];
    const employerId = idByEmail.get(e.ownerEmail);
    const categoryId = categories[j[1]];
    if (!employerId || !categoryId) return;
    const title = j[0].replace("{v}", e.place.village);
    jobs.push({
      title,
      slug: `${slugify(title)}-${e.i}`,
      description: `${j[7]} Location: ${e.place.village}, ${e.place.cell} cell, ${e.place.sector} sector, ${e.place.district}.`,
      district: e.place.district,
      sector: e.place.sector,
      lat: e.lat,
      lng: e.lng,
      jobType: j[2],
      payPeriod: j[3],
      payMin: j[4],
      payMax: j[5],
      workersNeeded: j[6],
      contactPhone: DEMO_WHATSAPP || phoneFor(e.i),
      status: "OPEN",
      categoryId,
      employerId,
      createdAt: daysAgo(e.r, 20),
    });
  });
  await inBatches(jobs, (rows) => prisma.job.createMany({ data: rows, skipDuplicates: true }));
  console.log(`  jobs: ${jobs.length}`);

  // 5. A few WhatsApp connections per shop so counters are not all zero.
  const connections = [];
  plan.forEach((e, idx) => {
    const sellerId = idByEmail.get(e.ownerEmail);
    if (!sellerId) return;
    const n = between(e.r, 0, 3);
    for (let k = 0; k < n; k += 1) {
      connections.push({ channel: "WHATSAPP", source: "PROFILE", sellerId, visitorKey: `village-${e.i}-${k}`, createdAt: daysAgo(e.r, 30) });
    }
  });
  const existingConnections = await prisma.connection.count({ where: { visitorKey: { startsWith: "village-" } } });
  if (existingConnections === 0) {
    await inBatches(connections, (rows) => prisma.connection.createMany({ data: rows }));
    console.log(`  connections: ${connections.length}`);
  }

  console.log("Village showcase ready.");
}

export async function removeVillages() {
  const owners = await prisma.user.findMany({ where: { email: { endsWith: `@${DOMAIN}` } }, select: { id: true } });
  const ids = owners.map((u) => u.id);
  const shops = await prisma.shop.findMany({ where: { ownerId: { in: ids } }, select: { id: true } });
  const shopIds = shops.map((s) => s.id);
  await prisma.listingImage.deleteMany({ where: { listing: { shopId: { in: shopIds } } } });
  await prisma.connection.deleteMany({ where: { OR: [{ sellerId: { in: ids } }, { buyerId: { in: ids } }, { listing: { shopId: { in: shopIds } } }] } });
  await prisma.listing.deleteMany({ where: { shopId: { in: shopIds } } });
  await prisma.jobApplication.deleteMany({ where: { OR: [{ applicantId: { in: ids } }, { job: { employerId: { in: ids } } }] } });
  await prisma.job.deleteMany({ where: { employerId: { in: ids } } });
  await prisma.shop.deleteMany({ where: { id: { in: shopIds } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  console.log(`Removed village showcase: ${ids.length} accounts, ${shopIds.length} shops.`);
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  const task = process.argv.includes("--remove") ? removeVillages() : seedVillages();
  task
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
