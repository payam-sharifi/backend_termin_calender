import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { BookingModule } from "../booking/booking.module";
import { ServiceModule } from "../service/service.module";
import { UserModule } from "../user/user.module";
import { AgentOrchestratorService } from "./agent-orchestrator.service";
import { ToolRegistryService } from "./tool-registry.service";
import { ToolRouterService } from "./tool-router.service";

@Module({
  imports: [AiModule, UserModule, ServiceModule, BookingModule],
  providers: [ToolRegistryService, ToolRouterService, AgentOrchestratorService],
  exports: [AgentOrchestratorService, ToolRegistryService],
})
export class AgentModule {}
