import { HttpException, Injectable } from "@nestjs/common";
import { BookingService } from "../booking/booking.service";
import { ServiceService } from "../service/service.service";
import { UserService } from "../user/user.service";
import type { AgentBackendToolCall } from "./agent-tool.schema";

/**
 * Executes agent tool calls by delegating to existing NestJS services only.
 */
@Injectable()
export class ToolRouterService {
  constructor(
    private readonly userService: UserService,
    private readonly serviceService: ServiceService,
    private readonly bookingService: BookingService
  ) {}

  async execute(call: AgentBackendToolCall): Promise<unknown> {
    switch (call.tool) {
      case "find_user": {
        const row = await this.userService.findCustomerByNameAndFamily(
          call.args.firstName,
          call.args.lastName
        );
        if (!row) {
          return { found: false };
        }
        return {
          found: true,
          userId: row.id,
          sex: row.sex,
        };
      }
      case "resolve_service": {
        return this.serviceService.resolveServiceForIntake(
          call.args.serviceQuery
        );
      }
      case "list_services": {
        return this.serviceService.listActiveServicesForIntake();
      }
      case "check_availability": {
        const sid = this.optionalId(call.args.serviceId);
        const ok = await this.bookingService.checkAvailability(
          call.args.date,
          call.args.time,
          sid
        );
        return { available: ok };
      }
      case "suggest_slots": {
        const sid = this.optionalId(call.args.serviceId);
        const slots = await this.bookingService.getAvailableSlots(
          call.args.date,
          call.args.requestedTime,
          sid
        );
        return { alternatives: slots };
      }
      case "create_intake_booking": {
        try {
          const res = await this.bookingService.createIntakeBooking({
            userId: call.args.userId,
            serviceId: call.args.serviceId,
            date: call.args.date,
            time: call.args.time,
            gender: call.args.gender,
          });
          return { ok: true, message: res.message };
        } catch (err: unknown) {
          if (err instanceof HttpException) {
            const response = err.getResponse();
            const msg =
              typeof response === "string"
                ? response
                : typeof response === "object" &&
                    response &&
                    "message" in response
                  ? String((response as { message: unknown }).message)
                  : err.message;
            return { ok: false, error: msg };
          }
          throw err;
        }
      }
      default: {
        const _exhaustive: never = call;
        return _exhaustive;
      }
    }
  }

  private optionalId(serviceId: string | undefined): string | undefined {
    const s = serviceId?.trim();
    return s || undefined;
  }
}
