/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `source_files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "source_files" DROP COLUMN "updatedAt",
ADD COLUMN     "save_finished" TIMESTAMP(3),
ADD COLUMN     "save_started" TIMESTAMP(3);
