/*
  Warnings:

  - Added the required column `customer_id` to the `TimeSlot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TimeSlot" ADD COLUMN     "customer_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
