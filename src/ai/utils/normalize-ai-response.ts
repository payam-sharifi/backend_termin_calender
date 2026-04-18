/**
 * Cleans model output before ChatController parses JSON or shows plain text.
 * Strips common markdown wrappers so behavior matches across providers.
 */
export function normalizeAiResponse(raw: string | null | undefined): string {
  if (raw == null) {
    return "";
  }

  let s = String(raw).trim();

  // Remove leading/trailing markdown code fences (models sometimes ignore "no markdown").
  s = stripCodeFences(s);

  // Collapse excessive blank lines from Gemini/OpenAI quirks.
  s = s.replace(/\n{3,}/g, "\n\n").trim();

  return s;
}

function stripCodeFences(text: string): string {
  let t = text.trim();
  if (!t.startsWith("```")) {
    return t;
  }
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/u, "").trim();
  return t;
}
