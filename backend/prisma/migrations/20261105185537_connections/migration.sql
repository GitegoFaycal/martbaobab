-- AlterTable
ALTER TABLE "User" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "source" TEXT NOT NULL DEFAULT 'LISTING',
    "listingId" TEXT,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT,
    "visitorKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Connection_sellerId_createdAt_idx" ON "Connection"("sellerId", "createdAt");

-- CreateIndex
CREATE INDEX "Connection_listingId_idx" ON "Connection"("listingId");

-- CreateIndex
CREATE INDEX "Connection_buyerId_idx" ON "Connection"("buyerId");

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
