import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { AiModule } from "../ai/ai.module";
import { BookingModule } from "../booking/booking.module";
import { ServiceModule } from "../service/service.module";
import { UserModule } from "../user/user.module";
import { ChatController } from "./chat.controller";

@Module({
  imports: [AiModule, BookingModule, UserModule, ServiceModule, AgentModule],
  controllers: [ChatController],
})
export class ChatModule {}
