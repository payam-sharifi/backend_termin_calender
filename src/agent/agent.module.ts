import { Module } from "@nestjs/common";
import { PrismaModule } from "prisma/prisma.module";
import { ServiceModule } from "src/service/service.module";
import { TimeSlotModule } from "src/time-slot/timeslot.module";
import { AgentService } from "./agent.service";
import { AgentController } from "./agent.controller";

@Module({
  imports: [PrismaModule, ServiceModule, TimeSlotModule],
  providers: [AgentService],
  controllers: [AgentController],
})
export class AgentModule {}
