import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Categories for the three LOCO sections. Icons are lucide-react icon names.
const CATEGORIES = [
  // Everyday goods from nearby shops
  { kind: "GOODS", name: "Food & groceries", slug: "food-groceries", icon: "ShoppingBasket" },
  { kind: "GOODS", name: "Drinks & water", slug: "drinks-water", icon: "CupSoda" },
  { kind: "GOODS", name: "Fresh produce", slug: "fresh-produce", icon: "Carrot" },
  { kind: "GOODS", name: "Phones & electronics", slug: "phones-electronics", icon: "Smartphone" },
  { kind: "GOODS", name: "Clothing & shoes", slug: "clothing-shoes", icon: "Shirt" },
  { kind: "GOODS", name: "Home & kitchen", slug: "home-kitchen", icon: "CookingPot" },
  { kind: "GOODS", name: "Beauty & personal care", slug: "beauty-care", icon: "Sparkles" },
  { kind: "GOODS", name: "Baby & kids", slug: "baby-kids", icon: "Baby" },
  { kind: "GOODS", name: "Building materials", slug: "building-materials", icon: "BrickWall" },
  { kind: "GOODS", name: "Furniture", slug: "furniture", icon: "Armchair" },
  { kind: "GOODS", name: "Motorbikes & bicycles", slug: "motorbikes-bicycles", icon: "Bike" },
  { kind: "GOODS", name: "Cooking gas & charcoal", slug: "gas-charcoal", icon: "Flame" },
  { kind: "GOODS", name: "Stationery & school", slug: "stationery-school", icon: "NotebookPen" },
  { kind: "GOODS", name: "Agriculture & livestock", slug: "agriculture-livestock", icon: "Sprout" },

  // Local services
  { kind: "SERVICES", name: "Moto & delivery", slug: "moto-delivery", icon: "Bike" },
  { kind: "SERVICES", name: "Plumbing & electrical", slug: "plumbing-electrical", icon: "Wrench" },
  { kind: "SERVICES", name: "Tailoring", slug: "tailoring", icon: "Scissors" },
  { kind: "SERVICES", name: "Salon & barber", slug: "salon-barber", icon: "Sparkles" },
  { kind: "SERVICES", name: "Phone & computer repair", slug: "phone-computer-repair", icon: "Smartphone" },
  { kind: "SERVICES", name: "Cleaning & laundry", slug: "cleaning-laundry", icon: "WashingMachine" },
  { kind: "SERVICES", name: "Catering & events", slug: "catering-events", icon: "ChefHat" },
  { kind: "SERVICES", name: "Tutoring & training", slug: "tutoring-training", icon: "GraduationCap" },
  { kind: "SERVICES", name: "Car & moto mechanics", slug: "mechanics", icon: "Car" },
  { kind: "SERVICES", name: "Photography & video", slug: "photography-video", icon: "Camera" },

  // Local jobs
  { kind: "JOBS", name: "Construction & building site", slug: "construction", icon: "HardHat" },
  { kind: "JOBS", name: "Factory & production", slug: "factory", icon: "Factory" },
  { kind: "JOBS", name: "Farming & agriculture", slug: "farming", icon: "Tractor" },
  { kind: "JOBS", name: "House help & childcare", slug: "house-help", icon: "Home" },
  { kind: "JOBS", name: "Security guard", slug: "security", icon: "ShieldCheck" },
  { kind: "JOBS", name: "Driver & moto rider", slug: "driver-rider", icon: "Truck" },
  { kind: "JOBS", name: "Shop & restaurant staff", slug: "shop-restaurant", icon: "Store" },
  { kind: "JOBS", name: "Cleaning & gardening", slug: "cleaning-gardening", icon: "Leaf" },
  { kind: "JOBS", name: "Loading & porter work", slug: "loading-porter", icon: "Package" },
  { kind: "JOBS", name: "Skilled trades", slug: "skilled-trades", icon: "Hammer" },
  { kind: "JOBS", name: "Office & sales", slug: "office-sales", icon: "Briefcase" },
  { kind: "JOBS", name: "Other local work", slug: "other-work", icon: "Users" },
];

async function seedCategories() {
  let position = 0;

  for (const category of CATEGORIES) {
    position += 1;

    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, icon: category.icon, kind: category.kind, position },
      create: { ...category, position },
    });
  }

  console.log(`Categories ready: ${CATEGORIES.length}`);
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "LOCO Administrator";

  if (!email || !password) {
    console.log(
      "Skipping administrator: set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env to create one."
    );
    return;
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must contain at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", active: true },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      emailVerified: true,
      district: "Gasabo",
    },
    select: { id: true, email: true },
  });

  console.log(`Administrator ready: ${admin.email}`);
}

async function main() {
  await seedCategories();
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
