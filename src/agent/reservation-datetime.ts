/**
 * Parses start datetime + optional **duration** (as `HH:mm` after start time).
 * Example: `2026-04-21 10:00 00:30` → start 10:00, duration 30 min (ends 10:30).
 * Without a third `HH:mm` segment, duration is omitted (caller uses service default).
 *
 * Also supports short dates (local system calendar) — see DATETIME_FORMAT_HELP.
 */

const FULL_DT_RE =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/;

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parsed duration must be >= 1 min (00:00 not allowed). */
const MIN_DURATION_MIN = 1;
const MAX_DURATION_MIN = 24 * 60;

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

function systemYearMonth(): { y: number; m: number } {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1 };
}

/** `HH:mm` as duration length: hours + minutes (e.g. 00:30 → 30). */
function durationMinutesFromParts(h: number, m: number): number | null {
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  const total = h * 60 + m;
  if (total < MIN_DURATION_MIN || total > MAX_DURATION_MIN) return null;
  return total;
}

export type ParsedReservationDateTime = {
  start: Date;
  /** Minutes; omit to use service default */
  durationMinutes?: number;
};

/**
 * Peels up to two trailing `\s+HH:mm` from the right:
 * - one → start time (or only time for short date)
 * - two → second-from-right = start time, rightmost = **duration**
 */
/** Each popped segment is from the right; `times[0]` = rightmost token. */
function peelTrailingTimes(s: string): {
  rest: string;
  times: { h: number; m: number }[];
} | null {
  let w = s.trim();
  const times: { h: number; m: number }[] = [];
  for (let i = 0; i < 2; i++) {
    const m = w.match(/\s+(\d{1,2}):(\d{2})$/);
    if (!m) break;
    const h = Number(m[1]);
    const mi = Number(m[2]);
    if (h > 23 || mi > 59) return null;
    times.push({ h, m: mi });
    w = w.slice(0, m.index).trim();
  }
  return { rest: w, times };
}

/** After times are peeled, parse date-only / short date; combine with start H/M. */
function parseRestWithStartTime(
  rest: string,
  startH: number,
  startM: number,
): Date | null {
  const s = rest.trim();
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
    return tryBuild(y, mo, d, startH, startM);
  }

  const nums = s.match(/\d+/g)?.map((x) => Number(x)) ?? [];

  if (nums.length === 1) {
    const day = nums[0];
    const { y, m } = systemYearMonth();
    return tryBuild(y, m, day, startH, startM);
  }

  if (nums.length === 2) {
    const day = nums[0];
    const month = nums[1];
    const { y } = systemYearMonth();
    return tryBuild(y, month, day, startH, startM);
  }

  if (nums.length >= 3 && nums[0] >= 1000 && nums[0] <= 9999) {
    const y = nums[0];
    const month = nums[1];
    const day = nums[2];
    return tryBuild(y, month, day, startH, startM);
  }

  return null;
}

export function parseReservationRequest(
  raw: string,
): ParsedReservationDateTime | null {
  const s0 = raw.trim();
  if (!s0) return null;

  const peeled = peelTrailingTimes(s0);
  if (peeled === null) return null;
  const { rest: r0, times: t0 } = peeled;

  let durationMinutes: number | undefined;
  let startH: number;
  let startM: number;
  let rest = r0;

  if (t0.length === 2) {
    const dur = durationMinutesFromParts(t0[0].h, t0[0].m);
    if (dur === null) return null;
    durationMinutes = dur;
    startH = t0[1].h;
    startM = t0[1].m;
  } else if (t0.length === 1) {
    startH = t0[0].h;
    startM = t0[0].m;
  } else {
    startH = 9;
    startM = 0;
    rest = s0;
  }

  const fullLine = rest.match(FULL_DT_RE);
  if (fullLine) {
    const y = Number(fullLine[1]);
    const mo = Number(fullLine[2]);
    const d = Number(fullLine[3]);
    const h = Number(fullLine[4]);
    const mi = Number(fullLine[5]);
    const start = tryBuild(y, mo, d, h, mi);
    if (!start) return null;
    return { start, durationMinutes };
  }

  const dateOnlyLine = rest.match(DATE_ONLY_RE);
  if (dateOnlyLine) {
    const y = Number(dateOnlyLine[1]);
    const mo = Number(dateOnlyLine[2]);
    const d = Number(dateOnlyLine[3]);
    const start = tryBuild(y, mo, d, startH, startM);
    if (!start) return null;
    return { start, durationMinutes };
  }

  const start = parseRestWithStartTime(rest, startH, startM);
  if (!start) return null;
  return { start, durationMinutes };
}

/** @deprecated Prefer parseReservationRequest when duration matters */
export function parseReservationDateTime(raw: string): Date | null {
  return parseReservationRequest(raw)?.start ?? null;
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

export function formatReservationDateLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export const DATETIME_FORMAT_HELP =
  "Zulässig: JJJJ-MM-TT HH:mm optional gefolgt von **Dauer** als HH:mm (z. B. `2026-04-21 10:00 00:30` = 30 Min.; ohne Dauer gilt die Dauer des Dienstes). Außerdem: nur JJJJ-MM-TT (09:00), kurz eine Zahl = Tag, zwei Zahlen = Tag/Monat (Jahr vom System), z. B. `18 14:30`, `15 4`, `15.4` — optional zwei Zeiten am Ende: Start und Dauer.";
