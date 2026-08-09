/*
  Warnings:

  - The values [LOCAL] on the enum `IdentityProvider` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `passwordHash` on the `Identity` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IdentityProvider_new" AS ENUM ('GOOGLE', 'GITHUB');
ALTER TABLE "Identity" ALTER COLUMN "provider" TYPE "IdentityProvider_new" USING ("provider"::text::"IdentityProvider_new");
ALTER TYPE "IdentityProvider" RENAME TO "IdentityProvider_old";
ALTER TYPE "IdentityProvider_new" RENAME TO "IdentityProvider";
DROP TYPE "public"."IdentityProvider_old";
COMMIT;

-- AlterTable
ALTER TABLE "Identity" DROP COLUMN "passwordHash";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT,
ALTER COLUMN "email" DROP NOT NULL;
