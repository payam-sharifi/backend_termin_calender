import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { Prisma, RoleEnum, StatusEnum, TimeSlotEnum } from "@prisma/client";
import { ServiceService } from "src/service/service.service";
import { TimeSlotService } from "src/time-slot/timeslot.service";
import {
  DATETIME_FORMAT_HELP,
  formatDateTimeBerlin,
  parseReservationDateTime,
} from "./reservation-datetime";

type CustomerSummary = {
  id: string;
  name: string;
  family: string;
};

export type ServicePick = {
  id: string;
  line: string;
};

@Injectable()
export class AgentService {
  constructor(
    private readonly prisma: PrismaService,
    /** `POST /service` — `getAllServicesWithProviderId`. */
    private readonly serviceService: ServiceService,
    /** `POST /timeslot` — `createTimeSlots`. */
    private readonly timeSlotService: TimeSlotService
  ) {}

  /** Resolve a real calendar service by id for this provider (from GET /service/:providerId). */
  private async resolveServiceForProvider(providerId: string, serviceId: string) {
    return this.prisma.service.findFirst({
      where: {
        id: serviceId,
        provider_id: providerId,
        is_active: true,
      },
    });
  }

  private serviceLine(s: {
    title: string;
    duration: number;
    price: number;
  }): string {
    return `${s.title} (${s.duration} min.) — ${s.price}€`;
  }

  /**
   * Step 1 of reservation chat: find registered customers by name (first / last / full name).
   */
  async lookupCustomerByName(customerName: string): Promise<{
    success: boolean;
    found: boolean;
    step?: "customer" | "service";
    message: string;
    customers?: CustomerSummary[];
    alternatives?: string[];
  }> {
    const q = typeof customerName === "string" ? customerName.trim() : "";
    if (!q.length) {
      return {
        success: false,
        found: false,
        step: "customer",
        message: "Please enter a customer name.",
      };
    }

    const base: Prisma.UserWhereInput = { role: RoleEnum.Customer };

    const words = q.split(/\s+/).filter((w) => w.length > 0);

    let where: Prisma.UserWhereInput = { ...base };

    if (words.length >= 2) {
      const rest = words.slice(1).join(" ");
      where = {
        ...base,
        AND: [
          { name: { contains: words[0], mode: "insensitive" } },
          { family: { contains: rest, mode: "insensitive" } },
        ],
      };
    } else {
      where = {
        ...base,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { family: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    const rows = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        family: true,
      },
      take: 8,
      orderBy: [{ name: "asc" }, { family: "asc" }],
    });

    const customers: CustomerSummary[] = rows.map((u) => ({
      id: u.id,
      name: u.name,
      family: u.family ?? "",
    }));

    if (customers.length === 0) {
      return {
        success: true,
        found: false,
        step: "customer",
        message:
          "No customer was found with that name in our system. Please check spelling or use the full first and last name if possible.",
        customers: [],
      };
    }

    if (customers.length === 1) {
      const c = customers[0];
      const full = [c.name, c.family].filter(Boolean).join(" ");
      return {
        success: true,
        found: true,
        step: "customer",
        message: `We found this customer: ${full}. Next, choose a service for them.`,
        customers,
      };
    }

    const alternatives = customers.map((c) =>
      [c.name, c.family].filter(Boolean).join(" ").trim()
    );

    return {
      success: true,
      found: true,
      step: "customer",
      message:
        "Multiple customers match. Each row is numbered — reply with that number (1, 2, …) to select, or type a new name to search again.",
      customers,
      alternatives,
    };
  }

  /**
   * Step 2: list/search services for this provider (same data as GET /service/:providerId).
   * Empty `serviceQuery` returns all active services (title order). Real DB ids are returned.
   */
  async searchServices(
    providerId: string | null,
    serviceQuery: string
  ): Promise<{
    success: boolean;
    found: boolean;
    step: "service";
    message: string;
    services?: ServicePick[];
    alternatives?: string[];
  }> {
    const pid = providerId?.trim() ?? "";
    if (!pid.length) {
      return {
        success: false,
        found: false,
        step: "service",
        message:
          "Provider is required to list services. Pass providerId or open the app with ?providerId=… in the URL.",
        services: [],
        alternatives: [],
      };
    }

    const rows = await this.prisma.service.findMany({
      where: {
        provider_id: pid,
        is_active: true,
        NOT: { title: { startsWith: "___SELF_RESERVATION___" } },
      },
      orderBy: { title: "asc" },
    });

    const q = typeof serviceQuery === "string" ? serviceQuery.trim() : "";
    const words = q.length
      ? q
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 0)
      : [];

    let list = rows;
    if (words.length > 0) {
      list = rows.filter((item) => {
        const t = `${item.title} ${item.description}`.toLowerCase();
        return words.every((w) => t.includes(w));
      });
    }

    if (list.length === 0) {
      return {
        success: true,
        found: false,
        step: "service",
        message:
          "No service matches that search. Try another word (e.g. part of the name) or leave the search empty to see the full list.",
        services: [],
        alternatives: [],
      };
    }

    const services: ServicePick[] = list.map((x) => ({
      id: x.id,
      line: this.serviceLine(x),
    }));
    const alternatives = list.map((x) => this.serviceLine(x));

    if (list.length === 1) {
      return {
        success: true,
        found: true,
        step: "service",
        message: `One service matches. Type 1 to confirm, or search again with other words.`,
        services,
        alternatives,
      };
    }

    return {
      success: true,
      found: true,
      step: "service",
      message:
        q.length > 0
          ? "Matching services — reply with a number (1, 2, …) to choose, or type new words to narrow the list."
          : "All services — reply with a number (1, 2, …) to choose, or type a word to filter the list.",
      services,
      alternatives,
    };
  }

  /**
   * Step 3: accept date/time format only (no free-slot check). User confirms in step 4.
   */
  async checkDateTimeAvailability(params: {
    providerId: string;
    serviceId: string;
    dateTime: string;
  }): Promise<{
    success: boolean;
    step: "datetime";
    message: string;
    requestedStartBerlin?: string;
  }> {
    const providerId = params.providerId?.trim();
    const serviceId = params.serviceId?.trim();
    if (!providerId || !serviceId) {
      return {
        success: false,
        step: "datetime",
        message: "Provider and service are required.",
      };
    }

    const parsed = parseReservationDateTime(params.dateTime ?? "");
    if (!parsed) {
      return {
        success: false,
        step: "datetime",
        message: `Invalid date/time. ${DATETIME_FORMAT_HELP}`,
      };
    }

    const service = await this.resolveServiceForProvider(providerId, serviceId);
    if (!service) {
      return {
        success: false,
        step: "datetime",
        message:
          "That service was not found for this provider. Choose a service from the list and try again.",
      };
    }

    const reqLabel = formatDateTimeBerlin(parsed);
    return {
      success: true,
      step: "datetime",
      message: `Time **${reqLabel}** (Berlin) is ready to book. Reply **yes** to confirm.`,
      requestedStartBerlin: reqLabel,
    };
  }

  /**
   * Step 4: `POST /service` (load day context) → `POST /timeslot` (`createTimeSlots`) →
   * appointment row + mark slot booked (same outcome as calendar booking flow).
   */
  async confirmBooking(params: {
    dateTime: string;
    serviceId: string;
    customerId: string;
    providerId: string;
  }): Promise<{ success: boolean; step: "done"; message: string }> {
    const providerId = params.providerId?.trim();
    const customerId = params.customerId?.trim();
    const serviceId = params.serviceId?.trim();
    const dateTimeRaw = params.dateTime?.trim() ?? "";

    if (!providerId || !customerId || !serviceId || !dateTimeRaw) {
      return {
        success: false,
        step: "done",
        message: "Missing booking data.",
      };
    }

    const parsed = parseReservationDateTime(dateTimeRaw);
    if (!parsed) {
      return {
        success: false,
        step: "done",
        message: `Invalid date/time. ${DATETIME_FORMAT_HELP}`,
      };
    }

    const service = await this.resolveServiceForProvider(providerId, serviceId);
    if (!service) {
      return {
        success: false,
        step: "done",
        message: "Service not found for this provider.",
      };
    }

    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
    });
    if (!customer || customer.role !== RoleEnum.Customer) {
      return {
        success: false,
        step: "done",
        message: "Customer not found.",
      };
    }

    const dateStr = dateTimeRaw.slice(0, 10);
    try {
      await this.serviceService.getAllServicesWithProviderId({
        provider_id: providerId,
        start_time: dateStr,
        end_time: dateStr,
      });
    } catch {
      /* non-fatal — same as optional context load */
    }

    const endParsed = new Date(
      parsed.getTime() + Math.max(1, service.duration) * 60 * 1000
    );

    let slotId: string;
    try {
      const created = await this.timeSlotService.createTimeSlots({
        customer_id: customerId,
        service_id: service.id,
        start_time: parsed.toISOString(),
        end_time: endParsed.toISOString(),
        name: customer.name,
        family: customer.family,
        email: customer.email ?? "",
        phone: customer.phone,
        sex: customer.sex,
        desc: "Chat reservation",
      });
      slotId = created.slot.id;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        step: "done",
        message: `Could not create the time slot: ${msg}`,
      };
    }

    try {
      await this.prisma.$transaction([
        this.prisma.appointment.create({
          data: {
            customer_id: customerId,
            provider_id: providerId,
            service_id: service.id,
            time_slot_id: slotId,
            status: StatusEnum.Confirmed,
            notes: "Chat reservation",
          },
        }),
        this.prisma.timeSlot.update({
          where: { id: slotId },
          data: {
            status: TimeSlotEnum.Booked,
            customer_id: customerId,
          },
        }),
      ]);
    } catch {
      return {
        success: false,
        step: "done",
        message:
          "The time slot was created but saving the appointment failed. Please contact support.",
      };
    }

    const when = formatDateTimeBerlin(parsed);
    return {
      success: true,
      step: "done",
      message: `Booking is confirmed for ${when} (Berlin).`,
    };
  }
}
