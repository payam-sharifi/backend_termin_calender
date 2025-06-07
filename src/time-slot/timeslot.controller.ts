import { Controller, Get, Query } from "@nestjs/common";
import { TimeSlotService } from "./timeslot.service";


@Controller("timeslot")
export class TimeSlotController {
  constructor(private readonly timeSlot: TimeSlotService) {}
  @Get()
  async AvailableTimeSlot(
    @Query('start_time') start_time: string,
    @Query('end_time') end_time: string,
    @Query('status') status: string 
  ) {
   
    return this.timeSlot.getAvailableTimeSlot(start_time, end_time, status);
  }
}
