-- Coordinates for true "nearby" (distance in km). Filled from the place's
-- centre point when a seller has not pinned the exact spot.
ALTER TABLE "Shop" ADD COLUMN "lat" DOUBLE PRECISION;
ALTER TABLE "Shop" ADD COLUMN "lng" DOUBLE PRECISION;
ALTER TABLE "Job" ADD COLUMN "lat" DOUBLE PRECISION;
ALTER TABLE "Job" ADD COLUMN "lng" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "lat" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "lng" DOUBLE PRECISION;
CREATE INDEX "Shop_lat_lng_idx" ON "Shop"("lat", "lng");
CREATE INDEX "Job_lat_lng_idx" ON "Job"("lat", "lng");
CREATE INDEX "User_lat_lng_idx" ON "User"("lat", "lng");
