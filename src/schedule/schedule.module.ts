import { Module } from "@nestjs/common";
import { ScheduleController } from "./schedule.controller";
import { ScheduleService } from "./schedule.service";
import { PrismaModule } from "prisma/prisma.module";

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
  imports: [PrismaModule],
  exports:[ScheduleModule]
})
export class ScheduleModule {}
