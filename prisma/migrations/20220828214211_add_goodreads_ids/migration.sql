/*
  Warnings:

  - You are about to drop the column `birth` on the `Author` table. All the data in the column will be lost.
  - Added the required column `goodReadsId` to the `Author` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goodReadsId` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Author` DROP COLUMN `birth`,
    ADD COLUMN `goodReadsId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Book` ADD COLUMN `goodReadsId` VARCHAR(191) NOT NULL,
    MODIFY `publishedAt` VARCHAR(191) NOT NULL;
