-- AlterTable
ALTER TABLE "User" ADD COLUMN "provider_id" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
