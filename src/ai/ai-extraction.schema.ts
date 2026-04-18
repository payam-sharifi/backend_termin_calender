import { z } from "zod";
import { normalizeHHmm } from "../booking/booking-time.util";

/**
 * Shape returned by the model when extraction succeeds (STRICT JSON).
 * Validated after stripping optional markdown fences from the assistant reply.
 */
export const bookingExtractSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
    time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
        "time must be HH:mm or HH:mm:ss (24h)"
      ),
  })
  .transform((data) => ({
    date: data.date,
    time: normalizeHHmm(data.time),
  }))
  .refine(
    (data) => {
      const d = new Date(`${data.date}T${data.time}:00`);
      return !Number.isNaN(d.getTime());
    },
    { message: "date and time do not form a valid calendar instant" }
  );

export type BookingExtract = z.infer<typeof bookingExtractSchema>;

/** When the model cannot infer a slot, it may return this shape instead. */
export const bookingErrorSchema = z.object({
  error: z.string().min(1),
});
