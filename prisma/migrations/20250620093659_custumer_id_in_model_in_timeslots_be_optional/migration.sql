-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_customer_id_fkey";

-- AlterTable
ALTER TABLE "TimeSlot" ALTER COLUMN "customer_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
