import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BookingService } from "../booking/booking.service";
import { ServiceService } from "../service/service.service";
import { UserService } from "../user/user.service";
import { BOOKING_AGENT_TOOLS } from "./booking-tools.registry";

type ServiceKey = (typeof BOOKING_AGENT_TOOLS)[number]["serviceClass"];

/**
 * Holds the canonical tool list and, in dev / when AI_TOOL_SCAN=true, validates
 * that each tool still maps to a real method on the injected services.
 */
@Injectable()
export class ToolRegistryService implements OnModuleInit {
  private readonly logger = new Logger(ToolRegistryService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly serviceService: ServiceService,
    private readonly bookingService: BookingService
  ) {}

  onModuleInit(): void {
    if (!this.shouldScan()) {
      return;
    }
    this.validateToolBindings();
  }

  getDefinitions() {
    return BOOKING_AGENT_TOOLS;
  }

  private shouldScan(): boolean {
    if (this.config.get<string>("AI_TOOL_SCAN")?.trim() === "true") {
      return true;
    }
    return process.env.NODE_ENV !== "production";
  }

  private validateToolBindings(): void {
    const map: Record<ServiceKey, object> = {
      UserService: this.userService,
      ServiceService: this.serviceService,
      BookingService: this.bookingService,
    };

    for (const t of BOOKING_AGENT_TOOLS) {
      const svc = map[t.serviceClass];
      const fn = (svc as Record<string, unknown>)[t.method];
      if (typeof fn !== "function") {
        this.logger.warn(
          `Agent tool "${t.name}" → ${t.serviceClass}.${t.method} is not a function (check registry vs service).`
        );
      }
    }

    this.logger.log(
      `AI tool binding scan: ${BOOKING_AGENT_TOOLS.length} tools checked against NestJS services.`
    );
  }
}
