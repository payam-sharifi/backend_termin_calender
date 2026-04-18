/** Strict format: `YYYY-MM-DD HH:mm` or `YYYY-MM-DDTHH:mm` (24h, local server time). */
const DT_RE =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/;

export function parseReservationDateTime(raw: string): Date | null {
  const s = raw.trim();
  const m = s.match(DT_RE);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  if (
    mo < 1 ||
    mo > 12 ||
    d < 1 ||
    d > 31 ||
    h > 23 ||
    mi > 59
  ) {
    return null;
  }
  const dt = new Date(y, mo - 1, d, h, mi, 0, 0);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt;
}

export function formatDateTimeBerlin(d: Date): string {
  return d.toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export const DATETIME_FORMAT_HELP =
  "Use exactly this format (24-hour clock, Europe/Berlin): YYYY-MM-DD HH:mm — example: 2026-04-18 14:30";
