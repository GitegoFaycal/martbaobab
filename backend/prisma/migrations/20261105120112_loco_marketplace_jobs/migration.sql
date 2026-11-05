/*
  Warnings:

  - The `provider` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `name` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ListingCondition" AS ENUM ('NEW', 'USED');

-- CreateEnum
CREATE TYPE "CategoryKind" AS ENUM ('GOODS', 'SERVICES', 'JOBS');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('DAILY', 'CONTRACT', 'PART_TIME', 'FULL_TIME');

-- CreateEnum
CREATE TYPE "PayPeriod" AS ENUM ('PER_DAY', 'PER_WEEK', 'PER_MONTH', 'PER_TASK');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED', 'FILLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MTN_MOMO', 'AIRTEL_MONEY', 'CASH_ON_DELIVERY');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT,
ADD COLUMN     "kind" "CategoryKind" NOT NULL DEFAULT 'GOODS',
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "condition" "ListingCondition" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "district" TEXT,
ADD COLUMN     "negotiable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalPrice" DECIMAL(12,2),
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryDistrict" TEXT,
ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "provider",
ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'CASH_ON_DELIVERY';

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "address" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "sector" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "district" TEXT;

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "district" TEXT NOT NULL,
    "sector" TEXT,
    "jobType" "JobType" NOT NULL DEFAULT 'DAILY',
    "payPeriod" "PayPeriod" NOT NULL DEFAULT 'PER_DAY',
    "payMin" DECIMAL(12,2),
    "payMax" DECIMAL(12,2),
    "workersNeeded" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3),
    "durationText" TEXT,
    "contactPhone" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "views" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "employerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "phone" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "jobId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_status_district_idx" ON "Job"("status", "district");

-- CreateIndex
CREATE INDEX "Job_categoryId_idx" ON "Job"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobId_applicantId_key" ON "JobApplication"("jobId", "applicantId");

-- CreateIndex
CREATE INDEX "Listing_condition_active_idx" ON "Listing"("condition", "active");

-- CreateIndex
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");

-- CreateIndex
CREATE INDEX "Listing_district_idx" ON "Listing"("district");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_shopId_status_idx" ON "Order"("shopId", "status");

-- CreateIndex
CREATE INDEX "Shop_district_idx" ON "Shop"("district");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
