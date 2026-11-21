-- Foreign-key indexes (PostgreSQL does not create them automatically).
CREATE INDEX IF NOT EXISTS "Shop_ownerId_idx" ON "Shop"("ownerId");
CREATE INDEX IF NOT EXISTS "Listing_shopId_idx" ON "Listing"("shopId");
CREATE INDEX IF NOT EXISTS "Listing_categoryId_idx" ON "Listing"("categoryId");
CREATE INDEX IF NOT EXISTS "ListingImage_listingId_idx" ON "ListingImage"("listingId");
CREATE INDEX IF NOT EXISTS "Job_employerId_idx" ON "Job"("employerId");
CREATE INDEX IF NOT EXISTS "JobApplication_jobId_idx" ON "JobApplication"("jobId");
CREATE INDEX IF NOT EXISTS "JobApplication_applicantId_idx" ON "JobApplication"("applicantId");
CREATE INDEX IF NOT EXISTS "Connection_buyerId_idx" ON "Connection"("buyerId");
CREATE INDEX IF NOT EXISTS "Connection_listingId_idx" ON "Connection"("listingId");
CREATE INDEX IF NOT EXISTS "Image_ownerId_idx" ON "Image"("ownerId");
