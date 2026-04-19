import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
} from "@nestjs/common";
import { AgentService } from "./agent.service";

/**
 * Chat: `customerName` | `serviceQuery`+`providerId?` |
 * `dateTime`+`serviceId`+`providerId` | `dateTime`+`providerId`+`selfReservation` (Selbst) |
 * `confirmBooking`+… (bei Selbst: `selfReservation`, kein `serviceId`)
 */
export type AgentChatBody = {
  customerName?: string;
  serviceQuery?: string;
  providerId?: string;
  dateTime?: string;
  serviceId?: string;
  confirmBooking?: boolean;
  customerId?: string;
  selfReservation?: boolean;
};

@Controller("api")
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post("chat")
  @HttpCode(200)
  async reservation(@Body() body: AgentChatBody) {
    if (
      body.confirmBooking === true &&
      typeof body.dateTime === "string" &&
      typeof body.providerId === "string" &&
      body.providerId.trim() &&
      (body.selfReservation === true
        ? true
        : Boolean(body.serviceId && body.customerId))
    ) {
      return this.agentService.confirmBooking({
        dateTime: body.dateTime,
        serviceId: body.serviceId,
        customerId:
          body.selfReservation === true
            ? (typeof body.customerId === "string" && body.customerId.trim()
                ? body.customerId
                : body.providerId
              ).trim()
            : String(body.customerId ?? "").trim(),
        providerId: body.providerId.trim(),
        selfReservation: body.selfReservation === true,
      });
    }

    if (
      typeof body.dateTime === "string" &&
      typeof body.providerId === "string" &&
      body.providerId.trim() &&
      (body.selfReservation === true ? true : Boolean(body.serviceId))
    ) {
      return this.agentService.checkDateTimeAvailability({
        providerId: body.providerId.trim(),
        serviceId: body.serviceId,
        dateTime: body.dateTime,
        selfReservation: body.selfReservation === true,
      });
    }

    if (typeof body?.serviceQuery === "string") {
      return await this.agentService.searchServices(
        body.providerId?.trim() ?? null,
        body.serviceQuery
      );
    }

    if (body?.customerName !== undefined) {
      return this.agentService.lookupCustomerByName(body.customerName ?? "");
    }

    throw new BadRequestException(
      "Erwartet: customerName, serviceQuery, dateTime mit serviceId und providerId (oder Selbstbuchung mit selfReservation), oder confirmBooking mit vollständigen Daten."
    );
  }
}
