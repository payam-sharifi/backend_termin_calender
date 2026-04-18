import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { buildBookingSystemPrompt } from "../ai-prompts";
import type { AIProvider, ChatMessage } from "../ai.types";

/**
 * OpenAI implementation — same behavior as the original AiService (gpt-4.1-mini, same prompt).
 */
@Injectable()
export class OpenAiProvider implements AIProvider {
  private readonly client: OpenAI;
  private readonly model = "gpt-4.1-mini" as const;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");
    this.client = new OpenAI({
      apiKey: apiKey ?? undefined,
    });
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    return this.complete(messages, buildBookingSystemPrompt(this.config));
  }

  async chatWithSystem(
    messages: ChatMessage[],
    systemPrompt: string
  ): Promise<string> {
    return this.complete(messages, systemPrompt);
  }

  private async complete(
    messages: ChatMessage[],
    systemPrompt: string
  ): Promise<string> {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.3,
      messages: openAiMessages,
    });

    const raw = completion.choices[0]?.message?.content;
    if (raw == null || typeof raw !== "string") {
      throw new Error("OpenAI returned an empty assistant message");
    }

    return raw;
  }
}
