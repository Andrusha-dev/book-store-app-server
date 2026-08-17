/*
  Warnings:

  - Added the required column `imgUrl` to the `Author` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "imgUrl" TEXT NOT NULL;
