import { z } from "zod";

const terminalAsk = z.object({
  tool: z.literal("ask_user"),
  args: z.object({
    message: z.string().min(1),
  }),
});

const terminalFinal = z.object({
  tool: z.literal("final_message"),
  args: z.object({
    message: z.string().min(1),
  }),
});

const findUser = z.object({
  tool: z.literal("find_user"),
  args: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  }),
});

const resolveService = z.object({
  tool: z.literal("resolve_service"),
  args: z.object({
    serviceQuery: z.string().min(1),
  }),
});

const listServices = z.object({
  tool: z.literal("list_services"),
  args: z.object({}).optional().default({}),
});

const checkAvailability = z.object({
  tool: z.literal("check_availability"),
  args: z.object({
    date: z.string().min(1),
    time: z.string().min(1),
    serviceId: z.string().optional(),
  }),
});

const suggestSlots = z.object({
  tool: z.literal("suggest_slots"),
  args: z.object({
    date: z.string().min(1),
    requestedTime: z.string().min(1),
    serviceId: z.string().optional(),
  }),
});

const createIntakeBooking = z.object({
  tool: z.literal("create_intake_booking"),
  args: z.object({
    userId: z.string().min(1),
    serviceId: z.string().min(1),
    date: z.string().min(1),
    time: z.string().min(1),
    gender: z.enum(["male", "female"]),
  }),
});

export const agentToolCallSchema = z.discriminatedUnion("tool", [
  terminalAsk,
  terminalFinal,
  findUser,
  resolveService,
  listServices,
  checkAvailability,
  suggestSlots,
  createIntakeBooking,
]);

export type AgentToolCall = z.infer<typeof agentToolCallSchema>;

/** Tools executed by ToolRouterService (excludes terminal ask_user / final_message). */
export type AgentBackendToolCall = Exclude<
  AgentToolCall,
  | { tool: "ask_user"; args: { message: string } }
  | { tool: "final_message"; args: { message: string } }
>;
