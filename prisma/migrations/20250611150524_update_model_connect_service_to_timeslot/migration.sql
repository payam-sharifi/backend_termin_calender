/*
  Warnings:

  - You are about to drop the column `provider_id` on the `TimeSlot` table. All the data in the column will be lost.
  - Added the required column `service_id` to the `TimeSlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_provider_id_fkey";

-- AlterTable
ALTER TABLE "TimeSlot" DROP COLUMN "provider_id",
ADD COLUMN     "service_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
