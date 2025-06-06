import { Controller, Get, Query } from "@nestjs/common";
import { TimeSlotService } from "./time-slot.service";

@Controller("time-slot")
export class TimeSlotController {
  constructor(private readonly timeSlot: TimeSlotService) {}
  @Get()
  async AvailableTimeSlot(
    @Query() start_time: string,
    end_time: string,
    status: string
  ) {
    return this.timeSlot.getAvailableTimeSlot(start_time, end_time, status);
  }
}
