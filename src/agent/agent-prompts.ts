import { ConfigService } from "@nestjs/config";
import { DateTime } from "luxon";
import { BOOKING_AGENT_TOOLS } from "./booking-tools.registry";

function formatToolsForPrompt(): string {
  const lines: string[] = [
    "You are a booking agent. You do NOT implement business rules yourself.",
    "You ONLY choose tools and pass arguments. The backend executes tools and returns JSON results.",
    "",
    "Collect from the user when needed: first name, last name (family), service, date, time, gender (male/female).",
    "If information is missing, use tool ask_user with a short natural question.",
    "",
    "Available tools (output EXACTLY one JSON object per turn, no markdown, no code fences, no extra text):",
    "",
  ];

  for (const t of BOOKING_AGENT_TOOLS) {
    const entries = Object.entries(t.args);
    lines.push(`- ${t.name}: ${t.description}`);
    if (entries.length === 0) {
      lines.push(`  Args: {}`);
    } else {
      const argLines = entries.map(([k, v]) => `    "${k}": <${v}>`).join("\n");
      lines.push(`  Args: {`);
      lines.push(argLines);
      lines.push(`  }`);
    }
    lines.push(`  Example: {"tool":"${t.name}","args":{...}}`);
    lines.push("");
  }

  lines.push("Terminal tools (no backend execution):");
  lines.push(
    '- ask_user — {"tool":"ask_user","args":{"message":"<question>"}} — when you need more information from the user.'
  );
  lines.push(
    '- final_message — {"tool":"final_message","args":{"message":"<text>"}} — when the conversation goal is satisfied (e.g. booking confirmed or you must explain failure).'
  );
  lines.push("");
  lines.push(
    "After each non-terminal tool, you will receive a user message starting with \"Tool result\" containing JSON. Use it to decide the next tool."
  );
  lines.push(
    "Never invent users, services, or availability — always rely on tool results."
  );

  return lines.join("\n");
}

export function buildAgentSystemPrompt(config: ConfigService): string {
  const tz = config.get<string>("BOOKING_TIMEZONE")?.trim() || "Europe/Berlin";
  const now = DateTime.now().setZone(tz);
  const today = now.toFormat("yyyy-MM-dd");
  const weekday = now.toFormat("cccc");
  const year = now.year;

  const calendar =
    `Calendar reference (${tz}): today is ${weekday}, ${today} (year ${year}). ` +
    `Interpret relative dates in this zone; use YYYY-MM-DD for dates and HH:mm for times.`;

  return `${formatToolsForPrompt()}\n\n---\n${calendar}`;
}
