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
 * `dateTime`+`serviceId`+`providerId` |
 * `confirmBooking`+`dateTime`+`serviceId`+`customerId`+`providerId`
 */
export type AgentChatBody = {
  customerName?: string;
  serviceQuery?: string;
  providerId?: string;
  dateTime?: string;
  serviceId?: string;
  confirmBooking?: boolean;
  customerId?: string;
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
      body.serviceId &&
      body.customerId &&
      body.providerId
    ) {
      return this.agentService.confirmBooking({
        dateTime: body.dateTime,
        serviceId: body.serviceId,
        customerId: body.customerId,
        providerId: body.providerId,
      });
    }

    if (
      typeof body.dateTime === "string" &&
      body.serviceId &&
      body.providerId
    ) {
      return this.agentService.checkDateTimeAvailability({
        providerId: body.providerId,
        serviceId: body.serviceId,
        dateTime: body.dateTime,
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
      "Erwartet: customerName, serviceQuery, dateTime mit serviceId und providerId, oder confirmBooking mit dateTime, serviceId, customerId, providerId."
    );
  }
}
