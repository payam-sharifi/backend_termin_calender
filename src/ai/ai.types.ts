/**
 * Shared types for the AI layer (providers + AiService).
 */
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};
/**
 * Pluggable LLM backend — returns raw assistant text (JSON or plain).
 */
export interface AIProvider {
  chat(messages: ChatMessage[]): Promise<string>;
}

