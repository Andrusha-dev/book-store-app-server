/*
  Warnings:

  - You are about to drop the column `quntity` on the `CartItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "quntity",
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;
