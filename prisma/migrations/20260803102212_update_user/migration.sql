/*
  Warnings:

  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `houseNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profession` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "IdentityProvider" AS ENUM ('LOCAL', 'GOOGLE', 'GITHUB');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "city",
DROP COLUMN "houseNumber",
DROP COLUMN "passwordHash",
DROP COLUMN "profession",
DROP COLUMN "street",
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "firstname" DROP NOT NULL,
ALTER COLUMN "lastname" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "birthYear" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Identity" (
    "id" TEXT NOT NULL,
    "provider" "IdentityProvider" NOT NULL,
    "providerId" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Identity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Identity_provider_providerId_key" ON "Identity"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "Identity" ADD CONSTRAINT "Identity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
