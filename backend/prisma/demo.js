// Demo content for LOCO: shops, listings (new, second-hand, services), jobs,
// applications and orders across Rwanda. Idempotent: safe to run many times.
//
// Runs when the marketplace is empty, or always when SEED_DEMO=true.
// Every demo account uses the password below.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrl } from "../src/config/database-url.js";

const prisma = new PrismaClient({ datasourceUrl: applyDatabaseUrl() || undefined });

export const DEMO_PASSWORD = "Demo1234";

const img = (keyword, lock) =>
  `https://loremflickr.com/800/600/${encodeURIComponent(keyword)}?lock=${lock}`;

const USERS = [
  // Sellers
  { key: "jeanne", name: "Jeanne Uwimana", email: "jeanne@demo.loco.rw", phone: "0788100001", district: "Gasabo", role: "SELLER" },
  { key: "eric", name: "Eric Habimana", email: "eric@demo.loco.rw", phone: "0788100002", district: "Kicukiro", role: "SELLER" },
  { key: "aline", name: "Aline Mukamana", email: "aline@demo.loco.rw", phone: "0722100003", district: "Nyarugenge", role: "SELLER" },
  { key: "patrick", name: "Patrick Nsengimana", email: "patrick@demo.loco.rw", phone: "0733100004", district: "Huye", role: "SELLER" },
  { key: "grace", name: "Grace Ingabire", email: "grace@demo.loco.rw", phone: "0788100005", district: "Musanze", role: "SELLER" },
  { key: "jmv", name: "Jean Marie Vianney Hakizimana", email: "jmv@demo.loco.rw", phone: "0788100006", district: "Rubavu", role: "SELLER" },
  { key: "claudine", name: "Claudine Umutoni", email: "claudine@demo.loco.rw", phone: "0722100007", district: "Rwamagana", role: "SELLER" },
  { key: "emmanuel", name: "Emmanuel Bizimana", email: "emmanuel@demo.loco.rw", phone: "0788100008", district: "Muhanga", role: "SELLER" },
  // Customers, workers and employers
  { key: "diane", name: "Diane Uwase", email: "diane@demo.loco.rw", phone: "0788200001", district: "Gasabo", role: "CUSTOMER" },
  { key: "kevin", name: "Kevin Mugisha", email: "kevin@demo.loco.rw", phone: "0722200002", district: "Kicukiro", role: "CUSTOMER" },
  { key: "olive", name: "Olive Nyirahabimana", email: "olive@demo.loco.rw", phone: "0788200003", district: "Nyarugenge", role: "CUSTOMER" },
  { key: "yves", name: "Yves Niyonzima", email: "yves@demo.loco.rw", phone: "0733200004", district: "Huye", role: "CUSTOMER" },
  { key: "sandrine", name: "Sandrine Mutesi", email: "sandrine@demo.loco.rw", phone: "0788200005", district: "Musanze", role: "CUSTOMER" },
  { key: "fabrice", name: "Fabrice Ndayisaba", email: "fabrice@demo.loco.rw", phone: "0788200006", district: "Gasabo", role: "CUSTOMER" },
  { key: "josiane", name: "Josiane Uwera", email: "josiane@demo.loco.rw", phone: "0722200007", district: "Rwamagana", role: "CUSTOMER" },
  { key: "innocent", name: "Innocent Tuyishime", email: "innocent@demo.loco.rw", phone: "0788200008", district: "Kicukiro", role: "CUSTOMER" },
];

const SHOPS = [
  { owner: "jeanne", name: "Mama Jeanne Boutique", slug: "mama-jeanne-boutique", district: "Gasabo", sector: "Kimironko", address: "Near Kimironko market, blue gate", description: "Groceries, drinks, airtime and household items. Open every day 6am to 10pm. Fast moto delivery in Kimironko and Kibagabaga.", verified: true, logo: img("grocery", 101), cover: img("market", 102) },
  { owner: "eric", name: "Imena Tech Kicukiro", slug: "imena-tech-kicukiro", district: "Kicukiro", sector: "Kagarama", address: "KK 15 Rd, opposite Sonatubes", description: "Phones, accessories, repairs and certified second-hand smartphones with 1 month guarantee.", verified: true, logo: img("smartphone", 103), cover: img("electronics", 104) },
  { owner: "aline", name: "Aline Fashion House", slug: "aline-fashion-house", district: "Nyarugenge", sector: "Nyamirambo", address: "Biryogo, near the mosque", description: "Tailoring, kitenge dresses, school uniforms and second-hand clothes (caguwa) in good condition.", verified: true, logo: img("fashion", 105), cover: img("tailor", 106) },
  { owner: "patrick", name: "Huye Hardware & Build", slug: "huye-hardware-build", district: "Huye", sector: "Ngoma", address: "Huye town, main road", description: "Cement, iron sheets, paint, tools and plumbing supplies. We deliver to construction sites in Huye district.", verified: false, logo: img("hardware", 107), cover: img("construction", 108) },
  { owner: "grace", name: "Musanze Fresh Farm", slug: "musanze-fresh-farm", district: "Musanze", sector: "Muhoza", address: "Musanze market, stall 42", description: "Irish potatoes, vegetables, fruits and eggs straight from farms around the volcanoes.", verified: true, logo: img("vegetables", 109), cover: img("farm", 110) },
  { owner: "jmv", name: "Rubavu Moto & Services", slug: "rubavu-moto-services", district: "Rubavu", sector: "Gisenyi", address: "Gisenyi, near the border post", description: "Moto delivery, airport and border transfers, and motorbike repairs.", verified: false, logo: img("motorbike", 111), cover: img("motorcycle", 112) },
  { owner: "claudine", name: "Claudine Home & Kitchen", slug: "claudine-home-kitchen", district: "Rwamagana", sector: "Kigabiro", address: "Rwamagana town centre", description: "Furniture, kitchenware, gas cylinders and second-hand sofas and beds.", verified: true, logo: img("furniture", 113), cover: img("kitchen", 114) },
  { owner: "emmanuel", name: "Muhanga Repairs & Electronics", slug: "muhanga-repairs-electronics", district: "Muhanga", sector: "Nyamabuye", address: "Muhanga bus park, shop 7", description: "Phone and laptop repairs, used laptops, solar lamps and electrical installation.", verified: false, logo: img("repair", 115), cover: img("laptop", 116) },
];

// [shop, category slug, name, price, options]
const LISTINGS = [
  ["mama-jeanne-boutique", "food-groceries", "Inyange milk 1L", 1200, { unit: "bottle", stock: 40, keyword: "milk", description: "Fresh Inyange whole milk, 1 litre. Keep refrigerated." }],
  ["mama-jeanne-boutique", "food-groceries", "Kabuye sugar 1kg", 1800, { unit: "kg", stock: 60, keyword: "sugar" }],
  ["mama-jeanne-boutique", "food-groceries", "Cooking oil 1L (Mount Meru)", 3200, { unit: "bottle", stock: 25, keyword: "cooking oil" }],
  ["mama-jeanne-boutique", "food-groceries", "Rice 5kg (Tanzania long grain)", 8500, { unit: "bag", stock: 15, keyword: "rice" }],
  ["mama-jeanne-boutique", "drinks-water", "Inyange water 500ml (pack of 12)", 4800, { unit: "pack", stock: 30, keyword: "water bottle" }],
  ["mama-jeanne-boutique", "drinks-water", "Fanta citron 500ml", 700, { unit: "bottle", stock: 100, keyword: "soda" }],
  ["mama-jeanne-boutique", "gas-charcoal", "Charcoal sack (medium)", 14000, { unit: "sack", stock: 8, keyword: "charcoal" }],
  ["mama-jeanne-boutique", "beauty-care", "Colgate toothpaste 100ml", 1500, { unit: "piece", stock: 50, keyword: "toothpaste" }],
  ["imena-tech-kicukiro", "phones-electronics", "Tecno Spark 20 (new, 128GB)", 145000, { stock: 6, keyword: "smartphone", description: "Brand new Tecno Spark 20, 8GB RAM, 128GB storage, dual SIM. 1 year warranty." }],
  ["imena-tech-kicukiro", "phones-electronics", "Samsung Galaxy A14 (used)", 95000, { condition: "USED", originalPrice: 180000, stock: 1, negotiable: true, keyword: "samsung phone", description: "6 months old, no scratches, comes with charger and box. Battery health 96%." }],
  ["imena-tech-kicukiro", "phones-electronics", "iPhone 11 64GB (used)", 260000, { condition: "USED", originalPrice: 520000, stock: 1, negotiable: true, keyword: "iphone", description: "Clean iPhone 11, face ID works, small scratch on back. Battery 84%." }],
  ["imena-tech-kicukiro", "phones-electronics", "Oraimo earphones", 6500, { stock: 20, keyword: "earphones" }],
  ["imena-tech-kicukiro", "phones-electronics", "Phone charger type-C fast", 4500, { stock: 35, keyword: "charger" }],
  ["imena-tech-kicukiro", "phone-computer-repair", "Phone screen replacement", 25000, { type: "SERVICE", unit: "repair", keyword: "phone repair", description: "Same-day screen replacement for Samsung, Tecno, Infinix and iPhone. Price from RWF 25,000 depending on model." }],
  ["aline-fashion-house", "clothing-shoes", "Kitenge dress (made to measure)", 35000, { unit: "piece", stock: 10, keyword: "african dress", description: "Choose your fabric, we sew it in 3 days." }],
  ["aline-fashion-house", "clothing-shoes", "School uniform set", 18000, { unit: "set", stock: 30, keyword: "school uniform" }],
  ["aline-fashion-house", "clothing-shoes", "Men's jeans (caguwa, good condition)", 7000, { condition: "USED", originalPrice: 25000, stock: 12, keyword: "jeans" }],
  ["aline-fashion-house", "clothing-shoes", "Ladies handbag (used, leather)", 12000, { condition: "USED", originalPrice: 40000, stock: 1, negotiable: true, keyword: "handbag" }],
  ["aline-fashion-house", "tailoring", "Tailoring and repairs", 3000, { type: "SERVICE", unit: "item", keyword: "sewing", description: "Hemming, zips, resizing and custom sewing. Visit the shop or we collect in Nyamirambo." }],
  ["huye-hardware-build", "building-materials", "Cement 50kg (CIMERWA)", 13500, { unit: "bag", stock: 200, keyword: "cement" }],
  ["huye-hardware-build", "building-materials", "Iron sheet 28 gauge (3m)", 11000, { unit: "sheet", stock: 120, keyword: "roof sheet" }],
  ["huye-hardware-build", "building-materials", "Paint 20L white (Sadolin)", 68000, { unit: "bucket", stock: 10, keyword: "paint" }],
  ["huye-hardware-build", "building-materials", "Wheelbarrow (used)", 18000, { condition: "USED", originalPrice: 35000, stock: 2, keyword: "wheelbarrow" }],
  ["huye-hardware-build", "plumbing-electrical", "Plumbing installation", 15000, { type: "SERVICE", unit: "visit", keyword: "plumber", description: "Pipes, taps, water tanks and toilets. Call-out in Huye from RWF 15,000." }],
  ["musanze-fresh-farm", "fresh-produce", "Irish potatoes 10kg", 6500, { unit: "bag", stock: 50, keyword: "potatoes" }],
  ["musanze-fresh-farm", "fresh-produce", "Tomatoes 1kg", 1200, { unit: "kg", stock: 80, keyword: "tomatoes" }],
  ["musanze-fresh-farm", "fresh-produce", "Eggs (tray of 30)", 4500, { unit: "tray", stock: 40, keyword: "eggs" }],
  ["musanze-fresh-farm", "fresh-produce", "Avocados (5 pieces)", 1500, { unit: "pack", stock: 60, keyword: "avocado" }],
  ["musanze-fresh-farm", "agriculture-livestock", "Maize seeds 2kg", 5200, { unit: "bag", stock: 25, keyword: "maize" }],
  ["rubavu-moto-services", "moto-delivery", "Moto delivery in Rubavu", 1000, { type: "SERVICE", unit: "trip", keyword: "motorcycle taxi", description: "Parcels and shopping delivered anywhere in Gisenyi within the hour." }],
  ["rubavu-moto-services", "mechanics", "Motorbike service and repair", 8000, { type: "SERVICE", unit: "service", keyword: "mechanic" }],
  ["rubavu-moto-services", "motorbikes-bicycles", "Bicycle (used, mountain bike)", 55000, { condition: "USED", originalPrice: 120000, stock: 1, negotiable: true, keyword: "bicycle" }],
  ["claudine-home-kitchen", "furniture", "3-seater sofa (used, fabric)", 85000, { condition: "USED", originalPrice: 220000, stock: 1, negotiable: true, keyword: "sofa", description: "Two years old, clean, no tears. Collect in Rwamagana or we arrange a truck." }],
  ["claudine-home-kitchen", "furniture", "Wooden bed 1.5m (new)", 120000, { stock: 3, keyword: "bed" }],
  ["claudine-home-kitchen", "home-kitchen", "Gas cylinder 12kg (refill)", 15500, { unit: "refill", stock: 20, keyword: "gas cylinder" }],
  ["claudine-home-kitchen", "home-kitchen", "Saucepan set (5 pieces)", 22000, { unit: "set", stock: 8, keyword: "cooking pot" }],
  ["claudine-home-kitchen", "home-kitchen", "Dining table + 4 chairs (used)", 60000, { condition: "USED", originalPrice: 150000, stock: 1, keyword: "dining table" }],
  ["muhanga-repairs-electronics", "phones-electronics", "HP laptop i5 8GB (used)", 220000, { condition: "USED", originalPrice: 450000, stock: 2, negotiable: true, keyword: "laptop", description: "HP ProBook, 8GB RAM, 256GB SSD, Windows 11. 3 months guarantee." }],
  ["muhanga-repairs-electronics", "phones-electronics", "Solar lamp with phone charging", 9500, { stock: 25, keyword: "solar lamp" }],
  ["muhanga-repairs-electronics", "phone-computer-repair", "Laptop repair and upgrade", 10000, { type: "SERVICE", unit: "repair", keyword: "computer repair" }],
  ["muhanga-repairs-electronics", "plumbing-electrical", "House electrical installation", 30000, { type: "SERVICE", unit: "job", keyword: "electrician" }],
];

const JOBS = [
  { employer: "patrick", category: "construction", title: "8 masons and 12 helpers for a school building in Huye", district: "Huye", sector: "Tumba", jobType: "DAILY", payPeriod: "PER_DAY", payMin: 3500, payMax: 6000, workersNeeded: 20, durationText: "4 months", description: "We are building a 6-classroom block in Tumba. Masons must have at least 2 years experience. Helpers need no experience. Work starts 7am, lunch is provided.", requirements: "ID card, own boots. Masons: experience with block work and plastering." },
  { employer: "diane", category: "house-help", title: "House help needed in Kibagabaga (live-in)", district: "Gasabo", sector: "Kibagabaga", jobType: "FULL_TIME", payPeriod: "PER_MONTH", payMin: 45000, payMax: 60000, workersNeeded: 1, description: "Family of four looking for a trustworthy house help for cooking, cleaning and helping with two children aged 3 and 6. Private room and meals provided.", requirements: "At least 1 year experience, references from a previous family, 22 to 40 years." },
  { employer: "eric", category: "shop-restaurant", title: "Shop attendant for phone shop in Kicukiro", district: "Kicukiro", sector: "Kagarama", jobType: "FULL_TIME", payPeriod: "PER_MONTH", payMin: 70000, payMax: 90000, workersNeeded: 1, description: "Serve customers, record sales in a notebook and on phone, keep the shop clean. Monday to Saturday, 8am to 7pm.", requirements: "Speaks Kinyarwanda and basic English, honest, can use a smartphone." },
  { employer: "kevin", category: "factory", title: "25 workers for a juice factory in the Special Economic Zone", district: "Gasabo", sector: "Masoro", jobType: "CONTRACT", payPeriod: "PER_MONTH", payMin: 60000, payMax: 75000, workersNeeded: 25, durationText: "6 months, renewable", description: "Packing and loading on a production line. Shifts of 8 hours, transport from Kimironko provided.", requirements: "18 to 45 years, able to stand for long periods, no experience needed." },
  { employer: "grace", category: "farming", title: "Potato harvest workers in Musanze", district: "Musanze", sector: "Kinigi", jobType: "DAILY", payPeriod: "PER_DAY", payMin: 2500, payMax: 3500, workersNeeded: 30, durationText: "2 weeks", description: "Harvesting and bagging Irish potatoes near Kinigi. Paid every evening in cash or MoMo.", requirements: "Bring your own hoe if you have one." },
  { employer: "jmv", category: "driver-rider", title: "Moto rider with own motorbike for deliveries in Rubavu", district: "Rubavu", sector: "Gisenyi", jobType: "PART_TIME", payPeriod: "PER_TASK", payMin: 1000, payMax: 3000, workersNeeded: 3, description: "Deliver parcels for our shop customers around Gisenyi. Paid per delivery, 15 to 25 deliveries a day.", requirements: "Valid licence, insured motorbike, smartphone with WhatsApp." },
  { employer: "olive", category: "security", title: "Night security guard for a compound in Nyamirambo", district: "Nyarugenge", sector: "Nyamirambo", jobType: "FULL_TIME", payPeriod: "PER_MONTH", payMin: 50000, payMax: 55000, workersNeeded: 2, description: "Guard a residential compound of 6 houses, 6pm to 6am, alternate nights.", requirements: "Previous guard experience, clean criminal record certificate." },
  { employer: "claudine", category: "loading-porter", title: "Porters to unload furniture truck on Saturday", district: "Rwamagana", sector: "Kigabiro", jobType: "DAILY", payPeriod: "PER_TASK", payMin: 5000, payMax: 5000, workersNeeded: 6, durationText: "1 day", description: "Unload a truck of sofas and beds and carry them into the shop. About 4 hours of work." },
  { employer: "emmanuel", category: "skilled-trades", title: "Electrician for solar installation in Muhanga", district: "Muhanga", sector: "Shyogwe", jobType: "CONTRACT", payPeriod: "PER_TASK", payMin: 80000, payMax: 120000, workersNeeded: 1, durationText: "1 week", description: "Install a 3kW solar system with batteries at a health post. Materials provided.", requirements: "Certificate in electrical installation, experience with solar systems." },
  { employer: "fabrice", category: "cleaning-gardening", title: "Gardener once a week in Kibagabaga", district: "Gasabo", sector: "Kibagabaga", jobType: "PART_TIME", payPeriod: "PER_DAY", payMin: 6000, payMax: 8000, workersNeeded: 1, description: "Mow the lawn, trim hedges and water the flowers every Saturday morning." },
  { employer: "yves", category: "tutoring-training", title: "Maths tutor for S3 student in Huye", district: "Huye", sector: "Ngoma", jobType: "PART_TIME", payPeriod: "PER_WEEK", payMin: 10000, payMax: 15000, workersNeeded: 1, description: "Two evenings a week, 1.5 hours each, at our home near the university.", requirements: "University student or teacher, patient." },
  { employer: "sandrine", category: "office-sales", title: "Sales agent for mobile money kiosk in Musanze", district: "Musanze", sector: "Muhoza", jobType: "FULL_TIME", payPeriod: "PER_MONTH", payMin: 55000, payMax: 80000, workersNeeded: 2, description: "Serve MoMo and Airtel Money customers, sell airtime and SIM cards. Commission on top of salary.", requirements: "Good with numbers, honest, ID required." },
];

const APPLICATIONS = [
  ["8 masons", "innocent", "I have worked 4 years as a mason in Kigali and can bring two helpers.", "SHORTLISTED"],
  ["8 masons", "fabrice", "Available immediately, I live in Tumba.", "PENDING"],
  ["House help", "josiane", "I worked 3 years for a family in Remera. References available.", "ACCEPTED"],
  ["Shop attendant", "diane", "I finished S6 and I am good with phones.", "PENDING"],
  ["25 workers", "innocent", "Ready to start, I live in Kimironko.", "ACCEPTED"],
  ["25 workers", "olive", "I have factory experience from Bralirwa.", "PENDING"],
  ["Potato harvest", "yves", "I can come with 5 friends from Kinigi.", "PENDING"],
  ["Night security", "kevin", "Ex-guard at KK Security, 3 years.", "SHORTLISTED"],
  ["Electrician", "innocent", "Certified electrician, installed solar at 4 schools.", "PENDING"],
  ["Maths tutor", "sandrine", "I study mathematics at UR Huye campus.", "ACCEPTED"],
];

const ORDERS = [
  { customer: "diane", shop: "mama-jeanne-boutique", items: [["Inyange milk 1L", 2], ["Kabuye sugar 1kg", 1], ["Rice 5kg (Tanzania long grain)", 1]], provider: "MTN_MOMO", status: "DELIVERED", district: "Gasabo", address: "Kibagabaga, near the hospital, house with green roof" },
  { customer: "kevin", shop: "imena-tech-kicukiro", items: [["Oraimo earphones", 1], ["Phone charger type-C fast", 1]], provider: "AIRTEL_MONEY", status: "OUT_FOR_DELIVERY", district: "Kicukiro", address: "Kagarama, KK 400 St" },
  { customer: "olive", shop: "aline-fashion-house", items: [["School uniform set", 2]], provider: "CASH_ON_DELIVERY", status: "CONFIRMED", district: "Nyarugenge", address: "Nyamirambo, Biryogo, near the mosque" },
  { customer: "fabrice", shop: "mama-jeanne-boutique", items: [["Inyange water 500ml (pack of 12)", 1], ["Fanta citron 500ml", 6]], provider: "MTN_MOMO", status: "PENDING", district: "Kicukiro", address: "Gikondo, near Magerwa" },
  { customer: "sandrine", shop: "musanze-fresh-farm", items: [["Irish potatoes 10kg", 2], ["Eggs (tray of 30)", 1]], provider: "MTN_MOMO", status: "DELIVERED", district: "Musanze", address: "Muhoza, behind the bus park" },
  { customer: "josiane", shop: "claudine-home-kitchen", items: [["Gas cylinder 12kg (refill)", 1]], provider: "CASH_ON_DELIVERY", status: "CANCELLED", district: "Rwamagana", address: "Kigabiro, near the district office" },
];

const slugify = (value) =>
  value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const normalizePhone = (value) => `+250${value.replace(/^0/, "")}`;

async function main() {
  const existingShops = await prisma.shop.count();

  if (existingShops > 0 && process.env.SEED_DEMO !== "true") {
    console.log(`Demo data skipped: marketplace already has ${existingShops} shops (set SEED_DEMO=true to force).`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = {};

  for (const user of USERS) {
    users[user.key] = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, district: user.district, role: user.role, active: true },
      create: {
        name: user.name,
        email: user.email,
        phone: normalizePhone(user.phone),
        district: user.district,
        role: user.role,
        passwordHash,
        emailVerified: true,
      },
    });
  }

  const shops = {};

  for (const shop of SHOPS) {
    const owner = users[shop.owner];
    shops[shop.slug] = await prisma.shop.upsert({
      where: { slug: shop.slug },
      update: { name: shop.name, description: shop.description, district: shop.district, city: shop.district, sector: shop.sector, address: shop.address, verified: shop.verified, logoUrl: shop.logo, coverUrl: shop.cover },
      create: {
        name: shop.name,
        slug: shop.slug,
        description: shop.description,
        phone: owner.phone,
        whatsapp: owner.phone,
        city: shop.district,
        district: shop.district,
        sector: shop.sector,
        address: shop.address,
        verified: shop.verified,
        logoUrl: shop.logo,
        coverUrl: shop.cover,
        ownerId: owner.id,
      },
    });
  }

  const categories = Object.fromEntries(
    (await prisma.category.findMany()).map((category) => [category.slug, category])
  );

  const listings = {};
  let lock = 200;

  for (const [shopSlug, categorySlug, name, price, options = {}] of LISTINGS) {
    const shop = shops[shopSlug];
    const category = categories[categorySlug];

    if (!shop || !category) {
      console.warn(`Skipping listing "${name}": missing shop or category ${categorySlug}`);
      continue;
    }

    const slug = slugify(name);
    lock += 1;

    const data = {
      name,
      description: options.description || `${name} from ${shop.name}, ${shop.district}.`,
      type: options.type || (category.kind === "SERVICES" ? "SERVICE" : "PRODUCT"),
      condition: options.condition || "NEW",
      price,
      originalPrice: options.originalPrice ?? null,
      unit: options.unit || null,
      negotiable: Boolean(options.negotiable),
      stock: options.type === "SERVICE" ? null : options.stock ?? 10,
      district: shop.district,
      active: true,
      categoryId: category.id,
      shopId: shop.id,
      views: 20 + ((lock * 37) % 400),
    };

    listings[name] = await prisma.listing.upsert({
      where: { slug },
      update: { ...data, images: { deleteMany: {}, create: [{ url: img(options.keyword || name, lock), alt: name, position: 0 }] } },
      create: { ...data, slug, images: { create: [{ url: img(options.keyword || name, lock), alt: name, position: 0 }] } },
    });
  }

  const jobs = {};

  for (const job of JOBS) {
    const slug = slugify(job.title);
    const employer = users[job.employer];
    const category = categories[job.category];
    const data = {
      title: job.title,
      description: job.description,
      requirements: job.requirements || null,
      district: job.district,
      sector: job.sector || null,
      jobType: job.jobType,
      payPeriod: job.payPeriod,
      payMin: job.payMin,
      payMax: job.payMax,
      workersNeeded: job.workersNeeded,
      durationText: job.durationText || null,
      startDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      contactPhone: employer.phone,
      status: "OPEN",
      categoryId: category?.id || null,
      employerId: employer.id,
      views: 15 + Math.floor(Math.random() * 200),
    };

    jobs[job.title] = await prisma.job.upsert({ where: { slug }, update: data, create: { ...data, slug } });
  }

  for (const [titleStart, applicantKey, message, status] of APPLICATIONS) {
    const job = Object.values(jobs).find((item) => item.title.startsWith(titleStart));
    const applicant = users[applicantKey];

    if (!job || !applicant) continue;

    await prisma.jobApplication.upsert({
      where: { jobId_applicantId: { jobId: job.id, applicantId: applicant.id } },
      update: { status, message },
      create: { jobId: job.id, applicantId: applicant.id, phone: applicant.phone, message, status },
    });
  }

  let orderIndex = 0;

  for (const order of ORDERS) {
    orderIndex += 1;
    const reference = `LOCO-DEMO-${String(orderIndex).padStart(3, "0")}`;
    const customer = users[order.customer];
    const shop = shops[order.shop];
    const items = order.items
      .filter(([name]) => listings[name])
      .map(([name, quantity]) => ({
        name,
        quantity,
        unitPrice: listings[name].price,
        listingId: listings[name].id,
      }));

    if (!items.length) continue;

    const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    const deliveryFee = order.district === shop.district ? 1000 : 2500;
    const total = subtotal + deliveryFee;

    const existing = await prisma.order.findUnique({ where: { reference } });

    if (existing) {
      await prisma.order.update({ where: { id: existing.id }, data: { status: order.status } });
      continue;
    }

    await prisma.order.create({
      data: {
        reference,
        status: order.status,
        subtotal,
        deliveryFee,
        total,
        customerPhone: customer.phone,
        deliveryDistrict: order.district,
        deliveryAddress: order.address,
        customerId: customer.id,
        shopId: shop.id,
        createdAt: new Date(Date.now() - orderIndex * 36 * 3600 * 1000),
        items: { create: items },
        payment: {
          create: {
            provider: order.provider,
            amount: total,
            status: order.status === "DELIVERED" ? "PAID" : "PENDING",
          },
        },
      },
    });
  }

  console.log(
    `Demo data ready: ${USERS.length} accounts, ${SHOPS.length} shops, ${Object.keys(listings).length} listings, ${JOBS.length} jobs, ${APPLICATIONS.length} applications, ${ORDERS.length} orders.`
  );
  console.log(`Demo accounts use the password "${DEMO_PASSWORD}" (e.g. jeanne@demo.loco.rw, diane@demo.loco.rw).`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
