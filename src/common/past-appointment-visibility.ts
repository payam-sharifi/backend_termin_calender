import { DateTime } from "luxon";

export const APP_TIMEZONE = "Europe/Berlin";
const PAST_WINDOW_DAYS = 15;
const MONTH_CUTOFF_DAY = 15;

/**
 * Earliest visible past day (YYYY-MM-DD):
 * - If today is after the 15th → from the 15th of the current month
 * - Otherwise → max(today − 15 days, 1st of current month)
 */
export function getEarliestVisiblePastYmd(
  now = DateTime.now().setZone(APP_TIMEZONE),
): string {
  if (now.day > MONTH_CUTOFF_DAY) {
    return now.set({ day: MONTH_CUTOFF_DAY }).toFormat("yyyy-MM-dd");
  }

  const monthStart = now.startOf("month");
  const windowStart = now.minus({ days: PAST_WINDOW_DAYS }).startOf("day");
  const earliest = windowStart > monthStart ? windowStart : monthStart;
  return earliest.toFormat("yyyy-MM-dd");
}

export function dayStartInAppTimezone(ymd: string): Date {
  return DateTime.fromFormat(ymd, "yyyy-MM-dd", { zone: APP_TIMEZONE })
    .startOf("day")
    .toJSDate();
}
