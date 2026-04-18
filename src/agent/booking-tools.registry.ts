/**
 * Declarative tool catalog for the booking agent.
 * Each tool maps 1:1 to an existing NestJS service method — ToolRouterService is the only executor.
 */
export type ToolArgSpec = Record<string, "string" | "boolean" | "optional_string">;

export type BookingToolDefinition = {
  /** Stable tool name sent by the model */
  name: string;
  /** Human + model-readable description */
  description: string;
  /** Existing NestJS service class name (for dev-time binding checks only) */
  serviceClass: "UserService" | "ServiceService" | "BookingService";
  /** Method name on that service */
  method: string;
  args: ToolArgSpec;
};

export const BOOKING_AGENT_TOOLS: BookingToolDefinition[] = [
  {
    name: "find_user",
    description:
      "Resolve a registered customer by first name + last name (maps to User.name and User.family). Returns userId if found.",
    serviceClass: "UserService",
    method: "findCustomerByNameAndFamily",
    args: {
      firstName: "string",
      lastName: "string",
    },
  },
  {
    name: "resolve_service",
    description:
      "Match a service by what the user said (exact title first, then contains). Returns unique id, none, or many matches.",
    serviceClass: "ServiceService",
    method: "resolveServiceForIntake",
    args: {
      serviceQuery: "string",
    },
  },
  {
    name: "list_services",
    description:
      "List active bookable services (id + title) when resolve_service fails or user asks what is available.",
    serviceClass: "ServiceService",
    method: "listActiveServicesForIntake",
    args: {},
  },
  {
    name: "check_availability",
    description:
      "Check if an Available time slot exists for the given local date (YYYY-MM-DD), time (HH:mm), and optional serviceId.",
    serviceClass: "BookingService",
    method: "checkAvailability",
    args: {
      date: "string",
      time: "string",
      serviceId: "optional_string",
    },
  },
  {
    name: "suggest_slots",
    description:
      "Suggest alternative HH:mm slots on the same day (or nearby) when the requested time is unavailable. Pass serviceId when known.",
    serviceClass: "BookingService",
    method: "getAvailableSlots",
    args: {
      date: "string",
      requestedTime: "string",
      serviceId: "optional_string",
    },
  },
  {
    name: "create_intake_booking",
    description:
      "Create the appointment after find_user and resolve_service succeeded and check_availability is true. Requires userId, serviceId, date, time, gender.",
    serviceClass: "BookingService",
    method: "createIntakeBooking",
    args: {
      userId: "string",
      serviceId: "string",
      date: "string",
      time: "string",
      gender: "string",
    },
  },
];
