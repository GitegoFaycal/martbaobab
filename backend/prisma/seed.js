import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "MartBaobab Administrator";

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before running the seed."
    );
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must contain at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      active: true,
    },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      emailVerified: true,
    },
    select: { id: true, email: true, role: true },
  });

  console.log(`Administrator ready: ${admin.email} (${admin.id})`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
