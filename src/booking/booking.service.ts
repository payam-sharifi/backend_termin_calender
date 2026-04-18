import { ConflictException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Sex, StatusEnum, TimeSlotEnum } from "@prisma/client";
import { DateTime } from "luxon";
import { PrismaService } from "prisma/prisma.service";
import {
  formatWallDateTime,
  formatWallTime,
  getBookingTimezone,
  hhmmToMinutes,
  localDayUtcBounds,
  normalizeHHmm,
  wallClockEquals,
} from "./booking-time.util";

const MAX_ALT_SLOTS = 5;

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  /** IANA zone for wall-clock matching (default Europe/Berlin). Set BOOKING_TIMEZONE in .env. */
  private tz(): string {
    return getBookingTimezone((k) => this.config.get<string>(k));
  }

  /**
   * True if an Available slot exists whose local wall clock in BOOKING_TIMEZONE
   * matches `date` + `time` (fixes UTC vs local mismatch from naive Date parsing).
   */
  async checkAvailability(
    date: string,
    time: string,
    serviceId?: string
  ): Promise<boolean> {
    const zone = this.tz();
    if (!this.isValidYmd(date)) {
      return false;
    }
    const hhmm = normalizeHHmm(time);
    const { start, end } = localDayUtcBounds(date, zone);

    const slots = await this.prisma.timeSlot.findMany({
      where: {
        status: TimeSlotEnum.Available,
        start_time: { gte: start, lte: end },
        ...(serviceId ? { service_id: serviceId } : {}),
      },
      select: { start_time: true },
    });

    const matchedAny = slots.some((s) =>
      wallClockEquals(s.start_time, date, hhmm, zone)
    );

    return matchedAny;
  }

  async createBooking(date: string, time: string): Promise<{ message: string }> {
    const zone = this.tz();
    const hhmm = normalizeHHmm(time);
    const { start, end } = localDayUtcBounds(date, zone);

    return this.prisma.$transaction(async (tx) => {
      const slots = await tx.timeSlot.findMany({
        where: {
          status: TimeSlotEnum.Available,
          start_time: { gte: start, lte: end },
        },
      });

      const slot = slots.find((s) =>
        wallClockEquals(s.start_time, date, hhmm, zone)
      );

      if (!slot) {
        throw new ConflictException("time not available");
      }

      await tx.timeSlot.update({
        where: { id: slot.id },
        data: { status: TimeSlotEnum.Booked },
      });

      return {
        message: `Your booking is confirmed for ${date} at ${time}.`,
      };
    });
  }

  /**
   * Full intake: book a slot for a specific service + customer, create appointment, sync gender.
   */
  async createIntakeBooking(params: {
    userId: string;
    serviceId: string;
    date: string;
    time: string;
    gender: "male" | "female";
  }): Promise<{ message: string }> {
    const zone = this.tz();
    const hhmm = normalizeHHmm(params.time);
    const { start, end } = localDayUtcBounds(params.date, zone);

    return this.prisma.$transaction(async (tx) => {
      const slots = await tx.timeSlot.findMany({
        where: {
          status: TimeSlotEnum.Available,
          service_id: params.serviceId,
          start_time: { gte: start, lte: end },
        },
      });

      const slot = slots.find((s) =>
        wallClockEquals(s.start_time, params.date, hhmm, zone)
      );

      if (!slot) {
        throw new ConflictException("time not available");
      }

      const sex = params.gender === "male" ? Sex.male : Sex.female;
      await tx.user.update({
        where: { id: params.userId },
        data: { sex },
      });

      await tx.timeSlot.update({
        where: { id: slot.id },
        data: { status: TimeSlotEnum.Booked, customer_id: params.userId },
      });

      const service = await tx.service.findUniqueOrThrow({
        where: { id: params.serviceId },
      });

      await tx.appointment.create({
        data: {
          customer_id: params.userId,
          provider_id: service.provider_id,
          service_id: params.serviceId,
          time_slot_id: slot.id,
          status: StatusEnum.Confirmed,
          notes: "",
        },
      });

      return { message: "Booking confirmed" };
    });
  }

  /**
   * Other Available starts on the same local calendar day, closest to requested time.
   * No artificial 30-min / 9–18 filters — uses real DB rows only.
   */
  async getAvailableSlots(
    date: string,
    requestedTime: string,
    serviceId?: string
  ): Promise<string[]> {
    const zone = this.tz();
    if (!this.isValidYmd(date)) {
      return [];
    }

    const { start, end } = localDayUtcBounds(date, zone);

    const rows = await this.prisma.timeSlot.findMany({
      where: {
        status: TimeSlotEnum.Available,
        start_time: { gte: start, lte: end },
        ...(serviceId ? { service_id: serviceId } : {}),
      },
      select: { start_time: true },
      orderBy: { start_time: "asc" },
    });

    const seen = new Set<string>();
    const candidates: string[] = [];

    for (const row of rows) {
      const hm = formatWallTime(row.start_time, zone);
      if (seen.has(hm)) continue;
      seen.add(hm);
      candidates.push(hm);
    }

    if (candidates.length === 0) {
      return this.getUpcomingFallbackAlternatives(zone, serviceId);
    }

    const reqNorm = normalizeHHmm(requestedTime);
    const reqMin = hhmmToMinutes(reqNorm) ?? 12 * 60;

    candidates.sort((a, b) => {
      const da = Math.abs((hhmmToMinutes(a) ?? 0) - reqMin);
      const db = Math.abs((hhmmToMinutes(b) ?? 0) - reqMin);
      if (da !== db) return da - db;
      return a.localeCompare(b);
    });

    return candidates.slice(
      0,
      Math.min(MAX_ALT_SLOTS, candidates.length)
    );
  }

  /**
   * When the requested calendar day has no Available rows, suggest the next
   * distinct slots (any day) as "YYYY-MM-DD HH:mm" in BOOKING_TIMEZONE.
   * Searches from "now" in zone; if empty, rescans ordered Available rows (handles edge cases).
   */
  private async getUpcomingFallbackAlternatives(
    zone: string,
    serviceId?: string
  ): Promise<string[]> {
    const now = DateTime.now().setZone(zone);
    const from = now.toUTC().toJSDate();

    const baseWhere = {
      status: TimeSlotEnum.Available,
      ...(serviceId ? { service_id: serviceId } : {}),
    };

    let rows = await this.prisma.timeSlot.findMany({
      where: {
        ...baseWhere,
        start_time: { gte: from },
      },
      select: { start_time: true },
      orderBy: { start_time: "asc" },
      take: 80,
    });

    if (rows.length === 0) {
      const pool = await this.prisma.timeSlot.findMany({
        where: baseWhere,
        select: { start_time: true },
        orderBy: { start_time: "asc" },
        take: 120,
      });
      rows = pool.filter((r) => r.start_time.getTime() >= from.getTime());
    }

    const seen = new Set<string>();
    const out: string[] = [];
    for (const row of rows) {
      const label = formatWallDateTime(row.start_time, zone);
      if (seen.has(label)) continue;
      seen.add(label);
      out.push(label);
      if (out.length >= MAX_ALT_SLOTS) break;
    }

    return out;
  }

  private isValidYmd(date: string): boolean {
    return DateTime.fromFormat(date, "yyyy-MM-dd").isValid;
  }
}
