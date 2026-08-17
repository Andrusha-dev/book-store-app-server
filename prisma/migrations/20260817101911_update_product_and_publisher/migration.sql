/*
  Warnings:

  - Made the column `widthMm` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `heightMm` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `depthMm` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weightGrams` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `logoUrl` on table `Publisher` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "imgUrls" DROP DEFAULT,
ALTER COLUMN "widthMm" SET NOT NULL,
ALTER COLUMN "heightMm" SET NOT NULL,
ALTER COLUMN "depthMm" SET NOT NULL,
ALTER COLUMN "weightGrams" SET NOT NULL;

-- AlterTable
ALTER TABLE "Publisher" ALTER COLUMN "logoUrl" SET NOT NULL;
