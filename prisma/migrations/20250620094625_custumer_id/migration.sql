/*
  Warnings:

  - Made the column `customer_id` on table `TimeSlot` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_customer_id_fkey";

-- AlterTable
ALTER TABLE "TimeSlot" ALTER COLUMN "customer_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
