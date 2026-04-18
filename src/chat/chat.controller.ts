import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiTags } from "@nestjs/swagger";
import { BookingService } from "../booking/booking.service";
import { AiService, ChatMessage } from "../ai/ai.service";
import { ServiceService } from "../service/service.service";
import { UserService } from "../user/user.service";
import {
  intakeCompleteSchema,
  intakeIncompleteSchema,
  intakeStructuredSchema,
  type IntakeComplete,
} from "./intake-extraction.schema";
import { AgentOrchestratorService } from "../agent/agent-orchestrator.service";
import { ChatMessageDto } from "./dto/chat-message.dto";

export class ServiceOptionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;
}

/**
 * Chat + structured intake (complete / incomplete) + booking orchestration.
 */
export class ChatResponseDto {
  @ApiProperty({ example: "Booking confirmed" })
  message: string;

  @ApiProperty({
    required: false,
    description: "When time is unavailable for the chosen service",
    type: [String],
  })
  alternatives?: string[];

  @ApiProperty({
    required: false,
    enum: [
      "chat",
      "incomplete",
      "complete",
      "need_user",
      "need_service",
      "booked",
    ],
  })
  intakeStatus?: string;

  @ApiProperty({ required: false, type: [String] })
  missing?: string[];

  @ApiProperty({ required: false, type: [ServiceOptionDto] })
  availableServices?: ServiceOptionDto[];

  @ApiProperty({
    required: false,
    description: "When true, response came from tool-router agent (/chat/agent).",
  })
  agentMode?: boolean;

  @ApiProperty({
    required: false,
    description: "Dev / AGENT_DEBUG: last agent tool steps.",
    type: "array",
    items: {
      type: "object",
      properties: {
        tool: { type: "string" },
        phase: { type: "string" },
      },
    },
  })
  toolTrace?: { tool: string; phase: string }[];
}

@ApiTags("chat")
@Controller("chat")
export class ChatController {
  constructor(
    private readonly aiService: AiService,
    private readonly bookingService: BookingService,
    private readonly userService: UserService,
    private readonly serviceService: ServiceService,
    private readonly agentOrchestrator: AgentOrchestratorService
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "AI booking intake + validation + booking" })
  async chat(@Body() body: ChatMessageDto): Promise<ChatResponseDto> {
    const history: ChatMessage[] = body.messages.map((m) => ({
      role: m.role as ChatMessage["role"],
      content: m.content,
    }));

    const ai = await this.aiService.chat(history);
    if (!ai.ok) {
      return { message: ai.error, intakeStatus: "chat" };
    }

    const assistantRaw = ai.content;
    const parsed = this.parseAssistantReply(assistantRaw);

    if (parsed.kind === "text") {
      return { message: parsed.text, intakeStatus: "chat" };
    }

    if (parsed.kind === "incomplete") {
      const missing = parsed.missing;
      return {
        message: `Please provide: ${missing.join(", ")}.`,
        intakeStatus: "incomplete",
        missing,
      };
    }

    const intake = parsed.data;

    // Step 1 — DB: `User.name` + `User.family` must match before service/availability/booking.
    const customer = await this.userService.findCustomerByNameAndFamily(
      intake.firstName,
      intake.lastName
    );
    if (!customer) {
      return {
        message:
          "We could not find a customer account with that first and last name. Please check spelling or register in the app first.",
        intakeStatus: "need_user",
      };
    }

    const serviceRes = await this.serviceService.resolveServiceForIntake(
      intake.service
    );

    if (serviceRes.kind === "none") {
      return {
        message:
          "We could not match that service name. See available services below.",
        intakeStatus: "need_service",
        availableServices: await this.serviceService.listActiveServicesForIntake(),
      };
    }

    if (serviceRes.kind === "many") {
      return {
        message:
          "Several services match. Please specify which one you want (exact name).",
        intakeStatus: "need_service",
        availableServices: serviceRes.services,
      };
    }

    const serviceId = serviceRes.id;

    try {
      const available = await this.bookingService.checkAvailability(
        intake.date,
        intake.time,
        serviceId
      );
      if (!available) {
        const alternatives = await this.bookingService.getAvailableSlots(
          intake.date,
          intake.time,
          serviceId
        );
        return {
          message: "This time is not available for that service.",
          alternatives,
          intakeStatus: "complete",
        };
      }

      await this.bookingService.createIntakeBooking({
        userId: customer.id,
        serviceId,
        date: intake.date,
        time: intake.time,
        gender: intake.gender,
      });

      return { message: "Booking confirmed", intakeStatus: "booked" };
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        const res = err.getResponse();
        const msg =
          typeof res === "string"
            ? res
            : typeof res === "object" && res && "message" in res
              ? String((res as { message: unknown }).message)
              : err.message;
        if (msg.includes("time not available") || err.getStatus() === 409) {
          const alternatives = await this.bookingService.getAvailableSlots(
            intake.date,
            intake.time,
            serviceId
          );
          return {
            message: "This time is not available for that service.",
            alternatives,
            intakeStatus: "complete",
          };
        }
      }
      throw err;
    }
  }

  /**
   * Tool-router agent: model emits JSON tool calls; backend executes User/Service/Booking services only.
   */
  @Post("agent")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "AI agent (tools): routes to existing NestJS services — does not replace /chat intake flow.",
  })
  async chatAgent(@Body() body: ChatMessageDto): Promise<ChatResponseDto> {
    const history: ChatMessage[] = body.messages.map((m) => ({
      role: m.role as ChatMessage["role"],
      content: m.content,
    }));

    const run = await this.agentOrchestrator.run(history);
    if (!run.ok) {
      return {
        message: run.message,
        intakeStatus: "chat",
        agentMode: true,
      };
    }

    return {
      message: run.message,
      intakeStatus: run.intakeStatus,
      alternatives: run.alternatives,
      availableServices: run.availableServices,
      agentMode: true,
      toolTrace: run.toolTrace,
    };
  }

  private parseAssistantReply(raw: string):
    | { kind: "text"; text: string }
    | { kind: "incomplete"; missing: string[] }
    | { kind: "complete"; data: IntakeComplete } {
    const trimmed = raw.trim();

    let jsonCandidate = trimmed.startsWith("{")
      ? trimmed
      : this.extractFirstJsonObject(trimmed);

    if (jsonCandidate == null) {
      return { kind: "text", text: raw };
    }

    if (jsonCandidate.startsWith("```")) {
      jsonCandidate = jsonCandidate
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/u, "")
        .trim();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonCandidate);
    } catch {
      const extracted = this.extractFirstJsonObject(trimmed);
      if (extracted == null) {
        return { kind: "text", text: raw };
      }
      try {
        parsed = JSON.parse(extracted);
      } catch {
        return { kind: "text", text: raw };
      }
    }

    const structured = intakeStructuredSchema.safeParse(parsed);
    if (structured.success) {
      if (structured.data.type === "incomplete") {
        return { kind: "incomplete", missing: structured.data.missing };
      }
      return { kind: "complete", data: structured.data };
    }

    const inc = intakeIncompleteSchema.safeParse(parsed);
    if (inc.success) {
      return { kind: "incomplete", missing: inc.data.missing };
    }

    const comp = intakeCompleteSchema.safeParse(parsed);
    if (comp.success) {
      return { kind: "complete", data: comp.data };
    }

    return { kind: "text", text: raw };
  }

  private extractFirstJsonObject(s: string): string | null {
    const start = s.indexOf("{");
    if (start === -1) return null;
    let depth = 0;
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return s.slice(start, i + 1);
      }
    }
    return null;
  }
}
