import { z } from "zod";
import { normalizeHHmm } from "../booking/booking-time.util";

/**
 * AI output when all intake fields are known (STRICT JSON, no markdown).
 */
export const intakeCompleteSchema = z
  .object({
    type: z.literal("complete"),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    gender: z.enum(["male", "female"]),
    service: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
        "time must be HH:mm or HH:mm:ss"
      ),
  })
  .transform((data) => ({
    ...data,
    time: normalizeHHmm(data.time),
  }))
  .refine(
    (data) => {
      const d = new Date(`${data.date}T${data.time}:00`);
      return !Number.isNaN(d.getTime());
    },
    { message: "date and time do not form a valid instant" }
  );

export type IntakeComplete = z.infer<typeof intakeCompleteSchema>;

/** AI output when some fields are still missing. */
export const intakeIncompleteSchema = z.object({
  type: z.literal("incomplete"),
  missing: z.array(z.string()).min(1),
});

export type IntakeIncomplete = z.infer<typeof intakeIncompleteSchema>;

export const intakeStructuredSchema = z.union([
  intakeCompleteSchema,
  intakeIncompleteSchema,
]);
