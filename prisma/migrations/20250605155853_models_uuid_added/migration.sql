/*
  Warnings:

  - The primary key for the `Appointment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Service` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TimeSlot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_ScheduleToUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_ServiceToUser` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_service_id_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_time_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "_ScheduleToUser" DROP CONSTRAINT "_ScheduleToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ScheduleToUser" DROP CONSTRAINT "_ScheduleToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceToUser" DROP CONSTRAINT "_ServiceToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceToUser" DROP CONSTRAINT "_ServiceToUser_B_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "customer_id" SET DATA TYPE TEXT,
ALTER COLUMN "provider_id" SET DATA TYPE TEXT,
ALTER COLUMN "service_id" SET DATA TYPE TEXT,
ALTER COLUMN "time_slot_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Appointment_id_seq";

-- AlterTable
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Schedule_id_seq";

-- AlterTable
ALTER TABLE "Service" DROP CONSTRAINT "Service_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Service_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Service_id_seq";

-- AlterTable
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "schedule_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TimeSlot_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "_ScheduleToUser" DROP CONSTRAINT "_ScheduleToUser_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_ScheduleToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_ServiceToUser" DROP CONSTRAINT "_ServiceToUser_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_ServiceToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "TimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceToUser" ADD CONSTRAINT "_ServiceToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceToUser" ADD CONSTRAINT "_ServiceToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleToUser" ADD CONSTRAINT "_ScheduleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleToUser" ADD CONSTRAINT "_ScheduleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
