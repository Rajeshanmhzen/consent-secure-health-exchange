/*
  Warnings:

  - A unique constraint covering the columns `[licenseNumber]` on the table `doctors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'CREATE_PATIENT';

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "licenseNumber" TEXT;

-- AlterTable
ALTER TABLE "hospitals" ADD COLUMN     "privateKey" TEXT,
ADD COLUMN     "publicKey" TEXT;

-- AlterTable
ALTER TABLE "medical_records" ADD COLUMN     "aesKeyIv" TEXT,
ADD COLUMN     "aesKeyTag" TEXT,
ADD COLUMN     "encryptedAesKey" TEXT;

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "yearlyPrice" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "receptionists" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Reception Staff';

-- AlterTable
ALTER TABLE "shared_records" ADD COLUMN     "encryptedAesKey" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profileImageUrl" TEXT;

-- CreateTable
CREATE TABLE "user_files" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "workEmail" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "organization" TEXT,
    "inquiryType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_files_userId_idx" ON "user_files"("userId");

-- CreateIndex
CREATE INDEX "user_files_uploadedById_idx" ON "user_files"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_licenseNumber_key" ON "doctors"("licenseNumber");

-- AddForeignKey
ALTER TABLE "user_files" ADD CONSTRAINT "user_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_files" ADD CONSTRAINT "user_files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
