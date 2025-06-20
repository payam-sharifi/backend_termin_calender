/*
  Warnings:

  - Added the required column `desc` to the `TimeSlot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TimeSlot" ADD COLUMN     "desc" TEXT NOT NULL;
