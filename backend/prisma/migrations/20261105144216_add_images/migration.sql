-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "data" BYTEA,
    "url" TEXT,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Image_ownerId_idx" ON "Image"("ownerId");
