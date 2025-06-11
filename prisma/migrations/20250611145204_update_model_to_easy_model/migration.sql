/*
  Warnings:

  - You are about to drop the column `schedule_id` on the `TimeSlot` table. All the data in the column will be lost.
  - Added the required column `provider_id` to the `TimeSlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_schedule_id_fkey";

-- AlterTable
ALTER TABLE "TimeSlot" DROP COLUMN "schedule_id",
ADD COLUMN     "provider_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
