-- People (specialists without a shop) can also give sector, cell and village.
ALTER TABLE "User" ADD COLUMN "sector" TEXT;
ALTER TABLE "User" ADD COLUMN "cell" TEXT;
ALTER TABLE "User" ADD COLUMN "village" TEXT;
CREATE INDEX "User_district_sector_idx" ON "User"("district", "sector");
