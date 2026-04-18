import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { GeminiProvider } from "./providers/gemini.provider";
import { OpenAiProvider } from "./providers/openai.provider";

@Module({
  providers: [OpenAiProvider, GeminiProvider, AiService],
  exports: [AiService],
})
export class AiModule {}
