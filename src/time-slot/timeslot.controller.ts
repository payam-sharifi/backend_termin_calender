import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { TimeSlotService } from "./timeslot.service";
import { CreateTimeSlotDto } from "./Dtos/createTimeSlots.dto";
import { getTimeSlotsDto } from "./Dtos/timeslot.dtos";

@Controller("timeslot")
export class TimeSlotController {
  constructor(private readonly timeSlot: TimeSlotService) {}
  @Get()
  async AvailableTimeSlot(@Body() body:getTimeSlotsDto)

   {
    return this.timeSlot.getAvailableTimeSlot(body);
  }

 


  @Post()
  async CreateTimeSlots(@Body() body: CreateTimeSlotDto) {
    if(!body) return "body is empty"
    return this.timeSlot.createTimeSlots(body)
  }
}
