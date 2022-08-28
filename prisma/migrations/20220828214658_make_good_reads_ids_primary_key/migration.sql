/*
  Warnings:

  - The primary key for the `Author` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Author` table. All the data in the column will be lost.
  - You are about to alter the column `goodReadsId` on the `Author` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Book` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Book` table. All the data in the column will be lost.
  - You are about to alter the column `authorId` on the `Book` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `goodReadsId` on the `Book` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `bookId` on the `Read` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `bookId` on the `Status` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Author` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    MODIFY `goodReadsId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`goodReadsId`);

-- AlterTable
ALTER TABLE `Book` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    MODIFY `authorId` INTEGER NOT NULL,
    MODIFY `goodReadsId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`goodReadsId`);

-- AlterTable
ALTER TABLE `Read` MODIFY `bookId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Status` DROP PRIMARY KEY,
    MODIFY `bookId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`bookId`, `userId`);
