import { DateTime } from "luxon";

/**
 * Wall-clock comparison in a fixed timezone (default Berlin) so DB UTC instants
 * line up with AI output "YYYY-MM-DD" + "HH:mm".
 */
export function getBookingTimezone(
  get: (key: string) => string | undefined
): string {
  const z = get("BOOKING_TIMEZONE")?.trim();
  return z && z.length > 0 ? z : "Europe/Berlin";
}

/** Normalize "9:30" / "09:30" / "17:00:00" → "09:30" / "17:00" */
export function normalizeHHmm(time: string): string {
  const t = time.trim();
  for (const fmt of ["H:mm:ss", "HH:mm:ss", "H:mm", "HH:mm"] as const) {
    const d = DateTime.fromFormat(t, fmt, { zone: "utc" });
    if (d.isValid) return d.toFormat("HH:mm");
  }
  return t;
}

/**
 * UTC instants for [start of day, end of day] in `timeZone` for `dateYmd`.
 */
export function localDayUtcBounds(
  dateYmd: string,
  timeZone: string
): { start: Date; end: Date } {
  const day = DateTime.fromFormat(dateYmd, "yyyy-MM-dd", {
    zone: timeZone,
  }).startOf("day");
  const end = day.endOf("day");
  return {
    start: day.toUTC().toJSDate(),
    end: end.toUTC().toJSDate(),
  };
}

/** True if this instant’s wall clock in `timeZone` equals date + time. */
export function wallClockEquals(
  instant: Date,
  dateYmd: string,
  hhmm: string,
  timeZone: string
): boolean {
  const normalized = normalizeHHmm(hhmm);
  const dt = DateTime.fromJSDate(instant).setZone(timeZone);
  return (
    dt.toFormat("yyyy-MM-dd") === dateYmd &&
    dt.toFormat("HH:mm") === normalized
  );
}

/** "HH:mm" for an instant in the given zone (for sorting / alternatives). */
export function formatWallTime(instant: Date, timeZone: string): string {
  return DateTime.fromJSDate(instant).setZone(timeZone).toFormat("HH:mm");
}

/** Full local date + time for cross-day alternative suggestions. */
export function formatWallDateTime(instant: Date, timeZone: string): string {
  const dt = DateTime.fromJSDate(instant).setZone(timeZone);
  return `${dt.toFormat("yyyy-MM-dd")} ${dt.toFormat("HH:mm")}`;
}

/** Minutes since midnight for sorting (expects normalized HH:mm). */
export function hhmmToMinutes(hhmm: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm.trim());
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
