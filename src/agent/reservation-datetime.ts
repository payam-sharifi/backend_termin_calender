/**
 * Accepts:
 * - `YYYY-MM-DD HH:mm` / `YYYY-MM-DDTHH:mm` (24h, local server time)
 * - `YYYY-MM-DD` only → time 09:00
 * - Optional short dates (local **system** calendar month/year/day when omitted):
 *   - one number → **day**; month and year from today
 *   - two numbers → **day** and **month**; year from today
 * - Optional trailing time ` … HH:mm` for short forms (default 09:00 if omitted)
 */

const FULL_DT_RE =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/;

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function tryBuild(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
): Date | null {
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) {
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

/** Current calendar year and month in the host’s local timezone (“system”). */
function systemYearMonth(): { y: number; m: number } {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1 };
}

export function parseReservationDateTime(raw: string): Date | null {
  const s = raw.trim();
  if (!s) return null;

  const full = s.match(FULL_DT_RE);
  if (full) {
    const y = Number(full[1]);
    const mo = Number(full[2]);
    const d = Number(full[3]);
    const h = Number(full[4]);
    const mi = Number(full[5]);
    return tryBuild(y, mo, d, h, mi);
  }

  const dateOnly = s.match(DATE_ONLY_RE);
  if (dateOnly) {
    const y = Number(dateOnly[1]);
    const mo = Number(dateOnly[2]);
    const d = Number(dateOnly[3]);
    return tryBuild(y, mo, d, 9, 0);
  }

  let work = s;
  let hh = 9;
  let mm = 0;
  const timeTail = work.match(/\s+(\d{1,2}):(\d{2})$/);
  if (timeTail) {
    hh = Number(timeTail[1]);
    mm = Number(timeTail[2]);
    if (hh > 23 || mm > 59) return null;
    work = work.slice(0, timeTail.index).trim();
  }

  if (!work) return null;

  const nums = work.match(/\d+/g)?.map((x) => Number(x)) ?? [];

  if (nums.length === 1) {
    const day = nums[0];
    const { y, m } = systemYearMonth();
    return tryBuild(y, m, day, hh, mm);
  }

  if (nums.length === 2) {
    const day = nums[0];
    const month = nums[1];
    const { y } = systemYearMonth();
    return tryBuild(y, month, day, hh, mm);
  }

  if (nums.length >= 3 && nums[0] >= 1000 && nums[0] <= 9999) {
    const y = nums[0];
    const month = nums[1];
    const day = nums[2];
    return tryBuild(y, month, day, hh, mm);
  }

  return null;
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

/** YYYY-MM-DD in local calendar, for API range hints. */
export function formatReservationDateLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export const DATETIME_FORMAT_HELP =
  "Zulässig: vollständig JJJJ-MM-TT HH:mm (24 h, z. B. 2026-04-18 14:30), oder nur JJJJ-MM-TT (dann 09:00), oder kurz eine Zahl = **Tag** (Monat/Jahr vom System), zwei Zahlen = **Tag** und **Monat** (Jahr vom System), optional mit Uhrzeit am Ende: `18 14:30`, `15 4 09:00`, `15.4`.";
