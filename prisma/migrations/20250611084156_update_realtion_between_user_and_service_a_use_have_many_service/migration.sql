/*
  Warnings:

  - You are about to drop the `_ServiceToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ServiceToUser" DROP CONSTRAINT "_ServiceToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceToUser" DROP CONSTRAINT "_ServiceToUser_B_fkey";

-- DropTable
DROP TABLE "_ServiceToUser";

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
