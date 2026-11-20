-- Finer location on shops: sector already exists; add cell and village.
ALTER TABLE "Shop" ADD COLUMN "cell" TEXT;
ALTER TABLE "Shop" ADD COLUMN "village" TEXT;
CREATE INDEX "Shop_district_sector_idx" ON "Shop"("district", "sector");
