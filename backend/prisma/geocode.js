// Gives every shop, job and person without coordinates the centre point of
// their place, so distance search covers them until the owner pins the exact
// spot. Idempotent: rows that already have coordinates are left alone.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrl } from "../src/config/database-url.js";
import { placeCentre } from "../src/services/geo.service.js";

const prisma = new PrismaClient({ datasourceUrl: applyDatabaseUrl() || undefined });

async function fill(model, rows, placeOf) {
  let filled = 0;
  for (const row of rows) {
    const centre = placeCentre(placeOf(row));
    if (!centre) continue;
    await prisma[model].update({ where: { id: row.id }, data: { lat: centre.lat, lng: centre.lng } });
    filled += 1;
  }
  return filled;
}

export async function geocodeAll() {
  const shops = await prisma.shop.findMany({ where: { lat: null, district: { not: null } }, select: { id: true, district: true, sector: true, cell: true } });
  const jobs = await prisma.job.findMany({ where: { lat: null }, select: { id: true, district: true, sector: true } });
  const users = await prisma.user.findMany({ where: { lat: null, district: { not: null } }, select: { id: true, district: true, sector: true, cell: true } });

  const s = await fill("shop", shops, (r) => r);
  const j = await fill("job", jobs, (r) => ({ district: r.district, sector: r.sector }));
  const u = await fill("user", users, (r) => r);
  console.log(`Coordinates ready: ${s} shops, ${j} jobs, ${u} people placed at their place centre.`);
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  geocodeAll()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
