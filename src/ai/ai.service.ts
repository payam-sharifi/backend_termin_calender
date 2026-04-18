import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { normalizeAiResponse } from "./utils/normalize-ai-response";
import { GeminiProvider } from "./providers/gemini.provider";
import { OpenAiProvider } from "./providers/openai.provider";
import type { ChatMessage } from "./ai.types";

export type { ChatMessage } from "./ai.types";

/** OpenAI call succeeded; `content` is the assistant reply (plain text OR strict JSON when ready to book). */
export type ChatOk = { ok: true; content: string };

/** Configuration or API failure — caller should surface `error` to the user. */
export type ChatErr = { ok: false; error: string };

export type ChatResult = ChatOk | ChatErr;

type ProviderKind = "openai" | "gemini";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly openAiProvider: OpenAiProvider,
    private readonly geminiProvider: GeminiProvider
  ) {}

  /**
   * AI_PROVIDER=openai | gemini (default: openai). Uses ConfigService for env parity with Nest.
   */
  private resolveProvider(): ProviderKind {
    const raw = this.config.get<string>("AI_PROVIDER");
    const v = raw?.toLowerCase()?.trim();
    return v === "gemini" ? "gemini" : "openai";
  }

  private hasGeminiKey(): boolean {
    return !!(
      this.config.get<string>("GEMINI_API_KEY") ||
      this.config.get<string>("GOOGLE_API_KEY")
    );
  }

  private hasOpenAiKey(): boolean {
    return !!this.config.get<string>("OPENAI_API_KEY");
  }

  /**
   * Same public contract as before (ChatResult): delegates to the selected provider,
   * normalizes text, and falls back to OpenAI when Gemini fails if a key exists.
   */
  async chat(messages: ChatMessage[]): Promise<ChatResult> {
    if (!messages?.length) {
      return {
        ok: false,
        error: "Please send at least one message to continue the conversation.",
      };
    }

    const preferred = this.resolveProvider();

    if (preferred === "gemini") {
      if (this.hasGeminiKey()) {
        return this.runGeminiWithOpenAiFallback(messages);
      }
      this.logger.warn(
        "AI_PROVIDER=gemini but no GEMINI_API_KEY/GOOGLE_API_KEY; attempting OpenAI"
      );
      if (!this.hasOpenAiKey()) {
        return {
          ok: false,
          error:
            "The booking assistant is not configured. Please try again later.",
        };
      }
      return this.runOpenAi(messages);
    }

    if (!this.hasOpenAiKey()) {
      this.logger.warn("OPENAI_API_KEY is not set");
      return {
        ok: false,
        error:
          "The booking assistant is not configured. Please try again later.",
      };
    }

    return this.runOpenAi(messages);
  }

  /**
   * Agent / tool-router: system prompt is separate from conversation history.
   */
  async chatWithSystem(
    messages: ChatMessage[],
    system: string
  ): Promise<ChatResult> {
    if (!messages?.length) {
      return {
        ok: false,
        error: "Please send at least one message to continue the conversation.",
      };
    }

    const preferred = this.resolveProvider();

    if (preferred === "gemini") {
      if (this.hasGeminiKey()) {
        return this.runGeminiWithOpenAiFallbackWithSystem(messages, system);
      }
      this.logger.warn(
        "AI_PROVIDER=gemini but no GEMINI_API_KEY/GOOGLE_API_KEY; attempting OpenAI"
      );
      if (!this.hasOpenAiKey()) {
        return {
          ok: false,
          error:
            "The booking assistant is not configured. Please try again later.",
        };
      }
      return this.runOpenAiWithSystem(messages, system);
    }

    if (!this.hasOpenAiKey()) {
      this.logger.warn("OPENAI_API_KEY is not set");
      return {
        ok: false,
        error:
          "The booking assistant is not configured. Please try again later.",
      };
    }

    return this.runOpenAiWithSystem(messages, system);
  }

  private async runOpenAiWithSystem(
    messages: ChatMessage[],
    system: string
  ): Promise<ChatResult> {
    try {
      const raw = await this.openAiProvider.chatWithSystem(messages, system);
      return this.toOk(raw);
    } catch (err: unknown) {
      this.logger.error(`OpenAI provider failed`, err);
      return {
        ok: false,
        error:
          "The booking assistant is temporarily unavailable. Please try again in a moment.",
      };
    }
  }

  private async runGeminiWithOpenAiFallbackWithSystem(
    messages: ChatMessage[],
    system: string
  ): Promise<ChatResult> {
    try {
      const raw = await this.geminiProvider.chatWithSystem(messages, system);
      return this.toOk(raw);
    } catch (err: unknown) {
      this.logger.warn(`Gemini provider failed`, err);
      if (!this.hasOpenAiKey()) {
        return this.toProviderDownError(err);
      }
      this.logger.warn(`Falling back to OpenAI after Gemini failure`);
      return this.runOpenAiWithSystem(messages, system);
    }
  }

  private async runOpenAi(messages: ChatMessage[]): Promise<ChatResult> {
    try {
      const raw = await this.openAiProvider.chat(messages);
      return this.toOk(raw);
    } catch (err: unknown) {
      this.logger.error(`OpenAI provider failed`, err);
      return {
        ok: false,
        error:
          "The booking assistant is temporarily unavailable. Please try again in a moment.",
      };
    }
  }

  /**
   * Gemini first; on any failure, retry with OpenAI if OPENAI_API_KEY is set.
   */
  private async runGeminiWithOpenAiFallback(
    messages: ChatMessage[]
  ): Promise<ChatResult> {
    try {
      const raw = await this.geminiProvider.chat(messages);
      return this.toOk(raw);
    } catch (err: unknown) {
      this.logger.warn(`Gemini provider failed`, err);
      if (!this.hasOpenAiKey()) {
        return this.toProviderDownError(err);
      }
      this.logger.warn(`Falling back to OpenAI after Gemini failure`);
      return this.runOpenAi(messages);
    }
  }

  private toOk(raw: string): ChatResult {
    const content = normalizeAiResponse(raw);
    if (!content) {
      return {
        ok: false,
        error:
          "We could not read a response from the assistant. Please try again.",
      };
    }
    return { ok: true, content };
  }

  private toProviderDownError(err: unknown): ChatResult {
    const message =
      err instanceof Error ? err.message : "Unknown provider error";
    this.logger.error(`AI provider unavailable: ${message}`, err);
    return {
      ok: false,
      error:
        "The booking assistant is temporarily unavailable. Please try again in a moment.",
    };
  }
}
