import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiService, ChatMessage } from "../ai/ai.service";
import { normalizeAiResponse } from "../ai/utils/normalize-ai-response";
import { buildAgentSystemPrompt } from "./agent-prompts";
import { extractFirstJsonObject } from "./agent-json.util";
import {
  agentToolCallSchema,
  type AgentBackendToolCall,
  type AgentToolCall,
} from "./agent-tool.schema";
import { ToolRouterService } from "./tool-router.service";

function toBackendToolCall(c: AgentToolCall): AgentBackendToolCall {
  switch (c.tool) {
    case "ask_user":
    case "final_message":
      throw new Error("terminal tool reached backend executor");
    default:
      return c;
  }
}

export type AgentRunResult =
  | {
      ok: true;
      message: string;
      intakeStatus:
        | "booked"
        | "chat"
        | "incomplete"
        | "need_user"
        | "need_service"
        | "complete";
      alternatives?: string[];
      availableServices?: { id: string; title: string }[];
      toolTrace?: { tool: string; phase: "call" | "result" }[];
    }
  | { ok: false; message: string; intakeStatus: "chat" };

/**
 * Multi-turn loop: model emits JSON tool calls → backend executes → results appended until terminal tool.
 */
@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly toolRouter: ToolRouterService,
    private readonly config: ConfigService
  ) {}

  async run(history: ChatMessage[]): Promise<AgentRunResult> {
    const maxSteps =
      Number(this.config.get<string>("AI_AGENT_MAX_STEPS")?.trim()) || 8;
    const debugTrace =
      this.config.get<string>("AGENT_DEBUG")?.trim() === "true" ||
      process.env.NODE_ENV !== "production";

    const system = buildAgentSystemPrompt(this.config);
    const messages: ChatMessage[] = [...history];
    const toolTrace: { tool: string; phase: "call" | "result" }[] = [];

    for (let step = 0; step < maxSteps; step++) {
      const ai = await this.aiService.chatWithSystem(messages, system);
      if (!ai.ok) {
        return { ok: false, message: ai.error, intakeStatus: "chat" };
      }

      const raw = normalizeAiResponse(ai.content);
      const parsed = this.parseToolJson(raw);
      if (!parsed.success) {
        return {
          ok: true,
          message: raw,
          intakeStatus: "chat",
          ...(debugTrace ? { toolTrace } : {}),
        };
      }

      const call = parsed.data;

      if (call.tool === "ask_user") {
        return {
          ok: true,
          message: call.args.message,
          intakeStatus: "incomplete",
          ...(debugTrace ? { toolTrace } : {}),
        };
      }

      if (call.tool === "final_message") {
        const status = this.inferStatusFromFinalMessage(call.args.message);
        return {
          ok: true,
          message: call.args.message,
          intakeStatus: status,
          ...(debugTrace ? { toolTrace } : {}),
        };
      }

      if (debugTrace) {
        toolTrace.push({ tool: call.tool, phase: "call" });
      }

      let result: unknown;
      try {
        result = await this.toolRouter.execute(toBackendToolCall(call));
      } catch (err: unknown) {
        this.logger.error(`Tool ${call.tool} failed`, err);
        messages.push({ role: "assistant", content: raw });
        messages.push({
          role: "user",
          content: `Tool result (${call.tool}): ${JSON.stringify({
            error: err instanceof Error ? err.message : "unknown error",
          })}`,
        });
        continue;
      }

      if (debugTrace) {
        toolTrace.push({ tool: call.tool, phase: "result" });
      }

      messages.push({ role: "assistant", content: raw });
      messages.push({
        role: "user",
        content: `Tool result (${call.tool}):\n${JSON.stringify(result)}`,
      });
    }

    return {
      ok: true,
      message:
        "The assistant could not finish booking in time. Please try again with a shorter request.",
      intakeStatus: "chat",
      ...(debugTrace ? { toolTrace } : {}),
    };
  }

  private inferStatusFromFinalMessage(
    text: string
  ): "booked" | "chat" {
    const t = text.toLowerCase();
    if (
      t.includes("confirm") &&
      (t.includes("book") || t.includes("appointment"))
    ) {
      return "booked";
    }
    return "chat";
  }

  private parseToolJson(raw: string): {
    success: true;
    data: AgentToolCall;
  } | { success: false } {
    let candidate = raw.trim();
    if (!candidate.startsWith("{")) {
      const extracted = extractFirstJsonObject(raw);
      if (extracted == null) {
        return { success: false };
      }
      candidate = extracted;
    }

    let data: unknown;
    try {
      data = JSON.parse(candidate);
    } catch {
      const extracted = extractFirstJsonObject(raw);
      if (extracted == null) {
        return { success: false };
      }
      try {
        data = JSON.parse(extracted);
      } catch {
        return { success: false };
      }
    }

    const parsed = agentToolCallSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false };
    }
    return { success: true, data: parsed.data };
  }
}
