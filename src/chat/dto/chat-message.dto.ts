import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

/**
 * Validates `messages` without requiring ValidationPipe `transform: true`
 * (nested plain objects from JSON still pass).
 */
@ValidatorConstraint({ name: "isChatMessages", async: false })
export class IsChatMessagesConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!Array.isArray(value) || value.length === 0) return false;
    const allowed = new Set(["user", "assistant", "system"]);
    for (const item of value) {
      if (!item || typeof item !== "object") return false;
      const m = item as { role?: unknown; content?: unknown };
      if (typeof m.role !== "string" || !allowed.has(m.role)) return false;
      if (typeof m.content !== "string" || m.content.trim().length === 0)
        return false;
      if (m.content.length > 12000) return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a non-empty array of { role: "user"|"assistant"|"system", content: string }`;
  }
}

/**
 * POST /chat body: full message history (stateless — client sends entire conversation each time).
 */
export class ChatMessageDto {
  @ApiProperty({
    description:
      "Conversation so far, in order (e.g. user → assistant → user).",
    example: [
      { role: "user", content: "Do you have time tomorrow?" },
      { role: "assistant", content: "What time would you prefer?" },
      { role: "user", content: "3 PM" },
    ],
    type: "array",
    items: {
      type: "object",
      properties: {
        role: { type: "string", enum: ["user", "assistant", "system"] },
        content: { type: "string" },
      },
    },
  })
  @IsArray()
  @ArrayMinSize(1)
  @Validate(IsChatMessagesConstraint)
  messages: { role: string; content: string }[];
}
