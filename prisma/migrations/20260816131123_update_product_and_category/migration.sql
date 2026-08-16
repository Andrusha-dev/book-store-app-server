/*
  Warnings:

  - You are about to drop the column `mainCategoryId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `_AllCategoryProducts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_mainCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "_AllCategoryProducts" DROP CONSTRAINT "_AllCategoryProducts_A_fkey";

-- DropForeignKey
ALTER TABLE "_AllCategoryProducts" DROP CONSTRAINT "_AllCategoryProducts_B_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "mainCategoryId";

-- DropTable
DROP TABLE "_AllCategoryProducts";

-- CreateTable
CREATE TABLE "_CategoryToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryToProduct_B_index" ON "_CategoryToProduct"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
