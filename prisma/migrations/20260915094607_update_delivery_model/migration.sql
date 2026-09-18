/*
  Warnings:

  - You are about to drop the column `recipientFullname` on the `Delivery` table. All the data in the column will be lost.
  - Added the required column `recipientFirstname` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientLastname` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "recipientFullname",
ADD COLUMN     "recipientFirstname" TEXT NOT NULL,
ADD COLUMN     "recipientLastname" TEXT NOT NULL;
