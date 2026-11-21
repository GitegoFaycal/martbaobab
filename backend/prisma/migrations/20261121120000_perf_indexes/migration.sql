-- Indexes for nationwide volumes (15k shops, 50k listings, 22k people).

-- Text search: trigram indexes when the extension is available (it is on
-- standard PostgreSQL and Prisma Postgres); skipped silently otherwise.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_trgm not available, skipping trigram indexes';
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    CREATE INDEX IF NOT EXISTS "Listing_name_trgm_idx" ON "Listing" USING gin (name gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "Listing_description_trgm_idx" ON "Listing" USING gin (description gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "Shop_name_trgm_idx" ON "Shop" USING gin (name gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "User_name_trgm_idx" ON "User" USING gin (name gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "User_headline_trgm_idx" ON "User" USING gin (headline gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "Job_title_trgm_idx" ON "Job" USING gin (title gin_trgm_ops);
  END IF;
END $$;

-- Common orderings and filters.
CREATE INDEX IF NOT EXISTS "Listing_active_createdAt_idx" ON "Listing"("active", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Listing_active_price_idx" ON "Listing"("active", "price");
CREATE INDEX IF NOT EXISTS "Listing_active_views_idx" ON "Listing"("active", "views" DESC);
CREATE INDEX IF NOT EXISTS "Listing_condition_type_idx" ON "Listing"("condition", "type");
CREATE INDEX IF NOT EXISTS "User_active_views_idx" ON "User"("active", "views" DESC);
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "Shop_verified_createdAt_idx" ON "Shop"("verified", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Job_status_createdAt_idx" ON "Job"("status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Connection_sellerId_createdAt_idx" ON "Connection"("sellerId", "createdAt" DESC);
