// Demo content for LOCO: shops, listings (new, second-hand, services), jobs,
// applications and orders across Rwanda. Idempotent: safe to run many times.
//
// Runs when the marketplace is empty, or always when SEED_DEMO=true. Photos
// are fetched once from Wikimedia Commons and stored in LOCO's own image
// table; later runs only repair missing or placeholder photos.
// Every demo account uses the password below.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrl } from "../src/config/database-url.js";
import {
  fetchAvatar,
  fetchCommonsPhoto,
  isStoredImage,
  mapLimit,
  placeholderSvg,
  storeImage,
} from "./demo-images.js";

const prisma = new PrismaClient({ datasourceUrl: applyDatabaseUrl() || undefined });

export const DEMO_PASSWORD = "Demo1234";

const USERS = [
  // Sellers
  { key: "jeanne", name: "Jeanne Uwimana", email: "jeanne@demo.loco.rw", phone: "0788100001", district: "Gasabo", role: "SELLER", headline: "Grocery shop owner in Kimironko", bio: "I have run Mama Jeanne Boutique for 9 years. Fresh milk every morning, airtime, gas and everything a home needs. We deliver by moto in Kimironko and Kibagabaga.", skills: ["Groceries","Airtime","Moto delivery"] },
  { key: "eric", name: "Eric Habimana", email: "eric@demo.loco.rw", phone: "0788100002", district: "Kicukiro", role: "SELLER", headline: "Phone seller and repair technician", bio: "Certified phone technician. New Tecno, Samsung and Infinix phones, and checked second-hand phones with a one month guarantee.", skills: ["Phone repair","Smartphones","Accessories"] },
  { key: "aline", name: "Aline Mukamana", email: "aline@demo.loco.rw", phone: "0722100003", district: "Nyarugenge", role: "SELLER", headline: "Tailor and kitenge designer", bio: "Trained at Nyamirambo vocational centre. Kitenge dresses, school uniforms, repairs and resizing, usually ready in three days.", skills: ["Tailoring","Kitenge","School uniforms"] },
  { key: "patrick", name: "Patrick Nsengimana", email: "patrick@demo.loco.rw", phone: "0733100004", district: "Huye", role: "SELLER", headline: "Hardware supplier and builder", bio: "20 years in construction. I supply cement, iron sheets and paint, and I can connect you with reliable masons in Huye.", skills: ["Building materials","Construction","Plumbing"] },
  { key: "grace", name: "Grace Ingabire", email: "grace@demo.loco.rw", phone: "0788100005", district: "Musanze", role: "SELLER", headline: "Farmer, fresh produce from Musanze", bio: "Our family farm near Kinigi grows Irish potatoes, tomatoes and vegetables. We sell at Musanze market and deliver to Kigali twice a week.", skills: ["Potatoes","Vegetables","Eggs"] },
  { key: "jmv", name: "Jean Marie Vianney Hakizimana", email: "jmv@demo.loco.rw", phone: "0788100006", district: "Rubavu", role: "SELLER", headline: "Moto rider and motorbike mechanic", bio: "Licensed moto rider in Gisenyi since 2015. Parcel delivery, border and airport transfers, and motorbike servicing.", skills: ["Moto delivery","Mechanic","Transport"] },
  { key: "claudine", name: "Claudine Umutoni", email: "claudine@demo.loco.rw", phone: "0722100007", district: "Rwamagana", role: "SELLER", headline: "Furniture and home goods seller", bio: "New and second-hand furniture, kitchenware and gas refills in Rwamagana. We arrange a truck for large items.", skills: ["Furniture","Kitchenware","Gas"] },
  { key: "emmanuel", name: "Emmanuel Bizimana", email: "emmanuel@demo.loco.rw", phone: "0788100008", district: "Muhanga", role: "SELLER", headline: "Electrician and laptop technician", bio: "Electrical installations for houses and small businesses, solar systems, and laptop repairs and upgrades in Muhanga.", skills: ["Electrician","Solar","Laptop repair"] },
  // Customers, workers and employers
  { key: "diane", name: "Diane Uwase", email: "diane@demo.loco.rw", phone: "0788200001", district: "Gasabo", role: "CUSTOMER", headline: "Nurse at Kibagabaga hospital", bio: "Mother of two in Kibagabaga. I post jobs for home help and gardening.", skills: ["Nursing","First aid"] },
  { key: "kevin", name: "Kevin Mugisha", email: "kevin@demo.loco.rw", phone: "0722200002", district: "Kicukiro", role: "CUSTOMER", headline: "Production supervisor, juice factory", bio: "I recruit packing and loading teams for the factory in the Special Economic Zone.", skills: ["Recruitment","Production"] },
  { key: "olive", name: "Olive Nyirahabimana", email: "olive@demo.loco.rw", phone: "0788200003", district: "Nyarugenge", role: "CUSTOMER", headline: "Property caretaker in Nyamirambo", bio: "I manage a residential compound and hire guards and cleaners.", skills: ["Property management"] },
  { key: "yves", name: "Yves Niyonzima", email: "yves@demo.loco.rw", phone: "0733200004", district: "Huye", role: "CUSTOMER", headline: "Secondary school teacher in Huye", bio: "Teacher of physics. Sometimes I look for tutors for my children.", skills: ["Teaching","Physics"] },
  { key: "sandrine", name: "Sandrine Mutesi", email: "sandrine@demo.loco.rw", phone: "0788200005", district: "Musanze", role: "CUSTOMER", headline: "Mobile money agent in Musanze", bio: "I run a MoMo and Airtel Money kiosk at Muhoza. Fast, honest service every day from 6am.", skills: ["Mobile money","Airtime","Customer service"] },
  { key: "fabrice", name: "Fabrice Ndayisaba", email: "fabrice@demo.loco.rw", phone: "0788200006", district: "Gasabo", role: "CUSTOMER", headline: "Driver and gardener", bio: "Professional driver with a clean licence, also experienced in gardening and lawn care in Gasabo.", skills: ["Driving","Gardening"] },
  { key: "josiane", name: "Josiane Uwera", email: "josiane@demo.loco.rw", phone: "0722200007", district: "Rwamagana", role: "CUSTOMER", headline: "Experienced house help and cook", bio: "Three years with a family in Remera. Cooking, cleaning and child care. References available.", skills: ["Cooking","Child care","Cleaning"] },
  { key: "innocent", name: "Innocent Tuyishime", email: "innocent@demo.loco.rw", phone: "0788200008", district: "Kicukiro", role: "CUSTOMER", headline: "Mason and solar installer", bio: "Four years of masonry in Kigali and certified solar installation. Available for daily or contract work.", skills: ["Masonry","Solar installation","Plastering"] },
];

// logo / cover are Wikimedia Commons search queries.
const SHOPS = [
  { owner: "jeanne", name: "Mama Jeanne Boutique", slug: "mama-jeanne-boutique", district: "Gasabo", sector: "Kimironko", address: "Near Kimironko market, blue gate", description: "Groceries, drinks, airtime and household items. Open every day 6am to 10pm. Fast moto delivery in Kimironko and Kibagabaga.", verified: true, logo: "grocery store shelves", cover: "Kimironko market Kigali" },
  { owner: "eric", name: "Imena Tech Kicukiro", slug: "imena-tech-kicukiro", district: "Kicukiro", sector: "Kagarama", address: "KK 15 Rd, opposite Sonatubes", description: "Phones, accessories, repairs and certified second-hand smartphones with 1 month guarantee.", verified: true, logo: "smartphone store display", cover: "mobile phone shop Africa" },
  { owner: "aline", name: "Aline Fashion House", slug: "aline-fashion-house", district: "Nyarugenge", sector: "Nyamirambo", address: "Biryogo, near the mosque", description: "Tailoring, kitenge dresses, school uniforms and second-hand clothes (caguwa) in good condition.", verified: true, logo: "kitenge fabric dress", cover: "tailor sewing machine workshop" },
  { owner: "patrick", name: "Huye Hardware & Build", slug: "huye-hardware-build", district: "Huye", sector: "Ngoma", address: "Huye town, main road", description: "Cement, iron sheets, paint, tools and plumbing supplies. We deliver to construction sites in Huye district.", verified: false, logo: "hardware store tools", cover: "construction site Rwanda" },
  { owner: "grace", name: "Musanze Fresh Farm", slug: "musanze-fresh-farm", district: "Musanze", sector: "Muhoza", address: "Musanze market, stall 42", description: "Irish potatoes, vegetables, fruits and eggs straight from farms around the volcanoes.", verified: true, logo: "fresh vegetables market stall", cover: "Volcanoes National Park Rwanda" },
  { owner: "jmv", name: "Rubavu Moto & Services", slug: "rubavu-moto-services", district: "Rubavu", sector: "Gisenyi", address: "Gisenyi, near the border post", description: "Moto delivery, airport and border transfers, and motorbike repairs.", verified: false, logo: "motorcycle taxi Rwanda", cover: "Gisenyi Lake Kivu" },
  { owner: "claudine", name: "Claudine Home & Kitchen", slug: "claudine-home-kitchen", district: "Rwamagana", sector: "Kigabiro", address: "Rwamagana town centre", description: "Furniture, kitchenware, gas cylinders and second-hand sofas and beds.", verified: true, logo: "furniture shop sofa", cover: "kitchen cookware shop" },
  { owner: "emmanuel", name: "Muhanga Repairs & Electronics", slug: "muhanga-repairs-electronics", district: "Muhanga", sector: "Nyamabuye", address: "Muhanga bus park, shop 7", description: "Phone and laptop repairs, used laptops, solar lamps and electrical installation.", verified: false, logo: "laptop computer repair", cover: "electronics repair shop" },
];

// [shop, category slug, name, price, options]; options.photo is the search query.
const LISTINGS = [
  ["mama-jeanne-boutique", "food-groceries", "Inyange milk 1L", 1200, { unit: "bottle", stock: 40, photo: "milk bottle carton", description: "Fresh Inyange whole milk, 1 litre. Keep refrigerated." }],
  ["mama-jeanne-boutique", "food-groceries", "Kabuye sugar 1kg", 1800, { unit: "kg", stock: 60, photo: "white sugar bag" }],
  ["mama-jeanne-boutique", "food-groceries", "Cooking oil 1L (Mount Meru)", 3200, { unit: "bottle", stock: 25, photo: "cooking oil bottle" }],
  ["mama-jeanne-boutique", "food-groceries", "Rice 5kg (Tanzania long grain)", 8500, { unit: "bag", stock: 15, photo: "rice sack grains" }],
  ["mama-jeanne-boutique", "drinks-water", "Inyange water 500ml (pack of 12)", 4800, { unit: "pack", stock: 30, photo: "bottled water pack" }],
  ["mama-jeanne-boutique", "drinks-water", "Fanta citron 500ml", 700, { unit: "bottle", stock: 100, photo: "Fanta bottle" }],
  ["mama-jeanne-boutique", "gas-charcoal", "Charcoal sack (medium)", 14000, { unit: "sack", stock: 8, photo: "charcoal bag" }],
  ["mama-jeanne-boutique", "beauty-care", "Colgate toothpaste 100ml", 1500, { unit: "piece", stock: 50, photo: "Colgate toothpaste tube" }],
  ["imena-tech-kicukiro", "phones-electronics", "Tecno Spark 20 (new, 128GB)", 145000, { stock: 6, photo: "Tecno smartphone", description: "Brand new Tecno Spark 20, 8GB RAM, 128GB storage, dual SIM. 1 year warranty." }],
  ["imena-tech-kicukiro", "phones-electronics", "Samsung Galaxy A14 (used)", 95000, { condition: "USED", originalPrice: 180000, stock: 1, negotiable: true, photo: "Samsung Galaxy smartphone front screen", description: "6 months old, no scratches, comes with charger and box. Battery health 96%." }],
  ["imena-tech-kicukiro", "phones-electronics", "iPhone 11 64GB (used)", 260000, { condition: "USED", originalPrice: 520000, stock: 1, negotiable: true, photo: "iPhone 11", description: "Clean iPhone 11, face ID works, small scratch on back. Battery 84%." }],
  ["imena-tech-kicukiro", "phones-electronics", "Oraimo earphones", 6500, { stock: 20, photo: "earphones earbuds" }],
  ["imena-tech-kicukiro", "phones-electronics", "Phone charger type-C fast", 4500, { stock: 35, photo: "USB-C phone charger" }],
  ["imena-tech-kicukiro", "phone-computer-repair", "Phone screen replacement", 25000, { type: "SERVICE", unit: "repair", photo: "smartphone screen repair", description: "Same-day screen replacement for Samsung, Tecno, Infinix and iPhone. Price from RWF 25,000 depending on model." }],
  ["aline-fashion-house", "clothing-shoes", "Kitenge dress (made to measure)", 35000, { unit: "piece", stock: 10, photo: "kitenge dress African print", description: "Choose your fabric, we sew it in 3 days." }],
  ["aline-fashion-house", "clothing-shoes", "School uniform set", 18000, { unit: "set", stock: 30, photo: "school uniform Rwanda" }],
  ["aline-fashion-house", "clothing-shoes", "Men's jeans (caguwa, good condition)", 7000, { condition: "USED", originalPrice: 25000, stock: 12, photo: "blue jeans denim" }],
  ["aline-fashion-house", "clothing-shoes", "Ladies handbag (used, leather)", 12000, { condition: "USED", originalPrice: 40000, stock: 1, negotiable: true, photo: "leather handbag" }],
  ["aline-fashion-house", "tailoring", "Tailoring and repairs", 3000, { type: "SERVICE", unit: "item", photo: "sewing machine tailor", description: "Hemming, zips, resizing and custom sewing. Visit the shop or we collect in Nyamirambo." }],
  ["huye-hardware-build", "building-materials", "Cement 50kg (CIMERWA)", 13500, { unit: "bag", stock: 200, photo: "cement bags" }],
  ["huye-hardware-build", "building-materials", "Iron sheet 28 gauge (3m)", 11000, { unit: "sheet", stock: 120, photo: "corrugated iron roofing sheets" }],
  ["huye-hardware-build", "building-materials", "Paint 20L white (Sadolin)", 68000, { unit: "bucket", stock: 10, photo: "paint bucket white" }],
  ["huye-hardware-build", "building-materials", "Wheelbarrow (used)", 18000, { condition: "USED", originalPrice: 35000, stock: 2, photo: "wheelbarrow" }],
  ["huye-hardware-build", "plumbing-electrical", "Plumbing installation", 15000, { type: "SERVICE", unit: "visit", photo: "plumber pipes wrench", description: "Pipes, taps, water tanks and toilets. Call-out in Huye from RWF 15,000." }],
  ["musanze-fresh-farm", "fresh-produce", "Irish potatoes 10kg", 6500, { unit: "bag", stock: 50, photo: "Irish potatoes" }],
  ["musanze-fresh-farm", "fresh-produce", "Tomatoes 1kg", 1200, { unit: "kg", stock: 80, photo: "fresh tomatoes" }],
  ["musanze-fresh-farm", "fresh-produce", "Eggs (tray of 30)", 4500, { unit: "tray", stock: 40, photo: "egg tray" }],
  ["musanze-fresh-farm", "fresh-produce", "Avocados (5 pieces)", 1500, { unit: "pack", stock: 60, photo: "avocados" }],
  ["musanze-fresh-farm", "agriculture-livestock", "Maize seeds 2kg", 5200, { unit: "bag", stock: 25, photo: "maize seeds" }],
  ["rubavu-moto-services", "moto-delivery", "Moto delivery in Rubavu", 1000, { type: "SERVICE", unit: "trip", photo: "motorcycle taxi Rwanda", description: "Parcels and shopping delivered anywhere in Gisenyi within the hour." }],
  ["rubavu-moto-services", "mechanics", "Motorbike service and repair", 8000, { type: "SERVICE", unit: "service", photo: "motorcycle mechanic repair" }],
  ["rubavu-moto-services", "motorbikes-bicycles", "Bicycle (used, mountain bike)", 55000, { condition: "USED", originalPrice: 120000, stock: 1, negotiable: true, photo: "mountain bike bicycle" }],
  ["claudine-home-kitchen", "furniture", "3-seater sofa (used, fabric)", 85000, { condition: "USED", originalPrice: 220000, stock: 1, negotiable: true, photo: "sofa couch living room", description: "Two years old, clean, no tears. Collect in Rwamagana or we arrange a truck." }],
  ["claudine-home-kitchen", "furniture", "Wooden bed 1.5m (new)", 120000, { stock: 3, photo: "wooden bed frame" }],
  ["claudine-home-kitchen", "home-kitchen", "Gas cylinder 12kg (refill)", 15500, { unit: "refill", stock: 20, photo: "LPG gas cylinder" }],
  ["claudine-home-kitchen", "home-kitchen", "Saucepan set (5 pieces)", 22000, { unit: "set", stock: 8, photo: "stainless steel cooking pots" }],
  ["claudine-home-kitchen", "home-kitchen", "Dining table + 4 chairs (used)", 60000, { condition: "USED", originalPrice: 150000, stock: 1, photo: "wooden dining table chairs" }],
  ["muhanga-repairs-electronics", "phones-electronics", "HP laptop i5 8GB (used)", 220000, { condition: "USED", originalPrice: 450000, stock: 2, negotiable: true, photo: "HP ProBook laptop", description: "HP ProBook, 8GB RAM, 256GB SSD, Windows 11. 3 months guarantee." }],
  ["muhanga-repairs-electronics", "phones-electronics", "Solar lamp with phone charging", 9500, { stock: 25, photo: "solar lantern lamp" }],
  ["muhanga-repairs-electronics", "phone-computer-repair", "Laptop repair and upgrade", 10000, { type: "SERVICE", unit: "repair", photo: "laptop repair technician" }],
  ["muhanga-repairs-electronics", "plumbing-electrical", "House electrical installation", 30000, { type: "SERVICE", unit: "job", photo: "electrician wiring" }],
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


const slugify = (value) =>
  value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const normalizePhone = (value) => `+250${value.replace(/^0/, "")}`;

// A stored image is "good" when it is a real photo; SVG placeholders are
// retried on later runs in case the photo source was unavailable.
// Placeholders are SVGs stored without a width; vector avatars record one.
async function isGoodStoredImage(url, { minWidth = 0, vector = false } = {}) {
  if (!isStoredImage(url)) return false;
  const id = url.split("/images/")[1];
  const image = await prisma.image.findUnique({ where: { id }, select: { mimeType: true, width: true } });
  if (!image) return false;
  const isSvg = image.mimeType === "image/svg+xml";
  if (isSvg && !image.width) return false;
  if (vector && !isSvg) return false;
  return (image.width ?? 0) >= minWidth;
}

async function photoOrPlaceholder(query, title) {
  try {
    return { ...(await fetchCommonsPhoto(query)), placeholder: false };
  } catch (error) {
    console.warn(`  no photo for "${title}" (${error.message}); using placeholder`);
    return { ...placeholderSvg(title), placeholder: true };
  }
}

async function seedPhotos() {
  const shops = await prisma.shop.findMany({ where: { slug: { in: SHOPS.map((shop) => shop.slug) } } });
  const listings = await prisma.listing.findMany({
    where: { shop: { slug: { in: SHOPS.map((shop) => shop.slug) } } },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const tasks = [];

  const demoUsers = await prisma.user.findMany({ where: { email: { in: USERS.map((user) => user.email) } } });
  for (const user of demoUsers) {
    // Avatars must be the vector renders; older 256px PNGs are replaced.
    if (!(await isGoodStoredImage(user.avatarUrl, { minWidth: 512, vector: true }))) {
      tasks.push({ kind: "avatar", user, title: user.name });
    }
  }

  for (const shop of shops) {
    const config = SHOPS.find((item) => item.slug === shop.slug);
    if (!(await isGoodStoredImage(shop.logoUrl))) {
      tasks.push({ kind: "logo", shop, query: config.logo, title: shop.name });
    }
    if (!(await isGoodStoredImage(shop.coverUrl))) {
      tasks.push({ kind: "cover", shop, query: config.cover, title: shop.name });
    }
  }

  for (const listing of listings) {
    const config = LISTINGS.find(([, , name]) => name === listing.name);
    if (!config) continue;
    if (!(await isGoodStoredImage(listing.images[0]?.url))) {
      tasks.push({ kind: "listing", listing, query: config[4]?.photo || listing.name, title: listing.name });
    }
  }

  if (tasks.length === 0) {
    console.log("Demo photos already in place.");
    return;
  }

  console.log(`Fetching ${tasks.length} demo photos...`);
  let placeholders = 0;

  await mapLimit(tasks, 4, async (task) => {
    if (task.kind === "avatar") {
      try {
        const url = await storeImage(prisma, await fetchAvatar(task.user.name), task.user.id);
        await prisma.user.update({ where: { id: task.user.id }, data: { avatarUrl: url } });
      } catch (error) {
        console.warn(`  no avatar for "${task.user.name}": ${error.message}`);
      }
      return;
    }

    const photo = await photoOrPlaceholder(task.query, task.title);
    if (photo.placeholder) placeholders += 1;

    // Keep an existing placeholder rather than replacing it with another one.
    if (photo.placeholder) {
      const current = task.kind === "listing" ? task.listing.images[0]?.url : task.kind === "logo" ? task.shop.logoUrl : task.shop.coverUrl;
      if (isStoredImage(current)) return;
    }

    const url = await storeImage(prisma, photo, task.kind === "listing" ? null : task.shop.ownerId);

    if (task.kind === "logo") {
      await prisma.shop.update({ where: { id: task.shop.id }, data: { logoUrl: url } });
    } else if (task.kind === "cover") {
      await prisma.shop.update({ where: { id: task.shop.id }, data: { coverUrl: url } });
    } else {
      await prisma.listing.update({
        where: { id: task.listing.id },
        data: { images: { deleteMany: {}, create: [{ url, alt: task.listing.name, position: 0 }] } },
      });
    }
  });

  console.log(`Demo photos ready: ${tasks.length - placeholders} photos, ${placeholders} placeholders.`);
}

async function seedContent() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = {};

  for (const user of USERS) {
    users[user.key] = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, district: user.district, role: user.role, active: true, headline: user.headline, bio: user.bio, skills: user.skills },
      create: { name: user.name, email: user.email, phone: normalizePhone(user.phone), district: user.district, role: user.role, passwordHash, emailVerified: true, headline: user.headline, bio: user.bio, skills: user.skills },
    });
  }

  const shops = {};

  for (const shop of SHOPS) {
    const owner = users[shop.owner];
    shops[shop.slug] = await prisma.shop.upsert({
      where: { slug: shop.slug },
      update: { name: shop.name, description: shop.description, district: shop.district, city: shop.district, sector: shop.sector, address: shop.address, verified: shop.verified },
      create: { name: shop.name, slug: shop.slug, description: shop.description, phone: owner.phone, whatsapp: owner.phone, city: shop.district, district: shop.district, sector: shop.sector, address: shop.address, verified: shop.verified, ownerId: owner.id },
    });
  }

  const categories = Object.fromEntries((await prisma.category.findMany()).map((category) => [category.slug, category]));
  const listings = {};
  let counter = 0;

  for (const [shopSlug, categorySlug, name, price, options = {}] of LISTINGS) {
    const shop = shops[shopSlug];
    const category = categories[categorySlug];

    if (!shop || !category) {
      console.warn(`Skipping listing "${name}": missing shop or category ${categorySlug}`);
      continue;
    }

    counter += 1;
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
      views: 20 + ((counter * 37) % 400),
    };

    listings[name] = await prisma.listing.upsert({ where: { slug: slugify(name) }, update: data, create: { ...data, slug: slugify(name) } });
  }

  const jobs = {};

  for (const job of JOBS) {
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

    jobs[job.title] = await prisma.job.upsert({ where: { slug: slugify(job.title) }, update: data, create: { ...data, slug: slugify(job.title) } });
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

  console.log(`Demo data ready: ${USERS.length} accounts, ${SHOPS.length} shops, ${Object.keys(listings).length} listings, ${JOBS.length} jobs, ${APPLICATIONS.length} applications.`);
  console.log(`Demo accounts use the password "${DEMO_PASSWORD}" (e.g. jeanne@demo.loco.rw, diane@demo.loco.rw).`);
}

// Deterministic pseudo-random so re-runs produce the same numbers.
function seeded(seed) {
  let value = seed % 2147483647;
  return () => (value = (value * 16807) % 2147483647) / 2147483647;
}

async function seedConnections() {
  const existing = await prisma.connection.count({ where: { seller: { email: { endsWith: "@demo.loco.rw" } } } });
  if (existing > 0) {
    console.log("Demo connections already present.");
    return;
  }

  const random = seeded(2026);
  const demoUsers = await prisma.user.findMany({ where: { email: { endsWith: "@demo.loco.rw" } } });
  const sellers = demoUsers.filter((user) => user.role === "SELLER" || user.headline);
  const buyers = demoUsers.filter((user) => user.role === "CUSTOMER");
  const listings = await prisma.listing.findMany({
    where: { shop: { owner: { email: { endsWith: "@demo.loco.rw" } } } },
    select: { id: true, shop: { select: { ownerId: true } } },
  });

  const rows = [];
  for (const listing of listings) {
    const count = 2 + Math.floor(random() * 12);
    for (let i = 0; i < count; i += 1) {
      const buyer = buyers[Math.floor(random() * buyers.length)];
      rows.push({
        channel: random() < 0.8 ? "WHATSAPP" : "CALL",
        source: "LISTING",
        listingId: listing.id,
        sellerId: listing.shop.ownerId,
        buyerId: buyer.id === listing.shop.ownerId ? null : buyer.id,
        visitorKey: buyer.id === listing.shop.ownerId ? `demo-${i}` : null,
        createdAt: new Date(Date.now() - Math.floor(random() * 30) * 24 * 3600 * 1000 - Math.floor(random() * 86400000)),
      });
    }
  }
  for (const seller of sellers) {
    const count = 1 + Math.floor(random() * 6);
    for (let i = 0; i < count; i += 1) {
      const buyer = buyers[Math.floor(random() * buyers.length)];
      if (buyer.id === seller.id) continue;
      rows.push({ channel: "WHATSAPP", source: "PROFILE", listingId: null, sellerId: seller.id, buyerId: buyer.id, visitorKey: null, createdAt: new Date(Date.now() - Math.floor(random() * 20) * 24 * 3600 * 1000) });
    }
  }
  await prisma.connection.createMany({ data: rows });

  for (const user of demoUsers) {
    await prisma.user.update({ where: { id: user.id }, data: { views: 40 + Math.floor(random() * 700) } });
  }

  console.log(`Demo connections ready: ${rows.length} connections, profile views set for ${demoUsers.length} people.`);
}

async function main() {
  const demoShops = await prisma.shop.count({ where: { slug: { in: SHOPS.map((shop) => shop.slug) } } });
  const allShops = await prisma.shop.count();

  if (allShops > 0 && demoShops === 0 && process.env.SEED_DEMO !== "true") {
    console.log(`Demo data skipped: marketplace already has ${allShops} shops (set SEED_DEMO=true to force).`);
    return;
  }

  // Re-run the content seed when demo profiles are missing newer fields,
  // so existing deployments pick up additions without SEED_DEMO=true.
  const profilesMissing = await prisma.user.count({
    where: { email: { in: USERS.map((user) => user.email) }, headline: null },
  });

  if (demoShops === 0 || profilesMissing > 0 || process.env.SEED_DEMO === "true") {
    await seedContent();
  } else {
    console.log("Demo content already present; checking photos.");
  }

  await seedPhotos();
  await seedConnections();
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
