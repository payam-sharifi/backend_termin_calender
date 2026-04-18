import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  GoogleGenerativeAI,
  type Content,
  type Part,
} from "@google/generative-ai";
import { buildBookingSystemPrompt } from "../ai-prompts";
import type { AIProvider, ChatMessage } from "../ai.types";

/**
 * Default model for Google AI Studio / generativelanguage.googleapis.com.
 * Short IDs like `gemini-1.5-flash` often 404 on v1beta — use a current stable id.
 * Override with env GEMINI_MODEL (e.g. gemini-2.0-flash-001, gemini-2.5-flash-preview).
 */
const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash-latest";

/**
 * Gemini implementation — mirrors OpenAI rules via the same BOOKING_SYSTEM_PROMPT.
 * Uses systemInstruction + multi-turn contents for parity with chat completions.
 */
@Injectable()
export class GeminiProvider implements AIProvider {
  constructor(private readonly config: ConfigService) {}

  private resolveModelName(): string {
    return (
      this.config.get<string>("GEMINI_MODEL")?.trim() || DEFAULT_GEMINI_MODEL
    );
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
    systemInstruction: string
  ): Promise<string> {
    const apiKey =
      this.config.get<string>("GEMINI_API_KEY") ??
      this.config.get<string>("GOOGLE_API_KEY");
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY or GOOGLE_API_KEY is not configured for Gemini"
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    let mergedInstruction = systemInstruction;
    const conversational: ChatMessage[] = [];

    for (const m of messages) {
      if (m.role === "system") {
        mergedInstruction += `\n\n${m.content}`;
      } else {
        conversational.push(m);
      }
    }

    const merged = this.mergeAdjacentSameRole(conversational);
    let turns = merged;
    if (turns.length && turns[0].role === "assistant") {
      turns = [{ role: "user", content: "Continue our booking conversation." }, ...turns];
    }

    const contents = this.toGeminiContents(turns);
    if (contents.length === 0) {
      throw new Error("No user or assistant messages to send to Gemini");
    }

    const model = genAI.getGenerativeModel({
      model: this.resolveModelName(),
      systemInstruction: mergedInstruction,
    });

    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 0.3,
      },
    });

    const text = result.response.text();
    if (text == null || text.trim() === "") {
      throw new Error("Gemini returned an empty assistant message");
    }

    return text;
  }

  /** Gemini expects alternating user/model; merge consecutive same-role lines. */
  private mergeAdjacentSameRole(messages: ChatMessage[]): ChatMessage[] {
    const merged: ChatMessage[] = [];
    for (const m of messages) {
      const last = merged[merged.length - 1];
      if (last && last.role === m.role) {
        last.content = `${last.content}\n\n${m.content}`;
      } else {
        merged.push({ role: m.role, content: m.content });
      }
    }
    return merged;
  }

  /**
   * Maps ChatMessage[] to Gemini's user/model turns (system already in systemInstruction).
   */
  private toGeminiContents(messages: ChatMessage[]): Content[] {
    const out: Content[] = [];
    for (const m of messages) {
      const role: "user" | "model" =
        m.role === "assistant" ? "model" : "user";
      const parts: Part[] = [{ text: m.content }];
      out.push({ role, parts });
    }
    return out;
  }
}
