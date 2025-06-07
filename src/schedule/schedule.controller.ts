import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { CreateScheduleDto } from "./Dtos/create.schedule.dtos";

@Controller("schedule")
export class ScheduleController {
  constructor(private readonly schedule: ScheduleService) {}
  @Post()
  async createSchedule(@Body() body: CreateScheduleDto[]) {
    if (body) {
      const schedules = await this.schedule.createManySchedules(body);
      return `${schedules.count}row(s) Added`;
    } else return "you have sent empty request";
  }

  // @Get()
  // async AvailableTimeSlot(
  //   @Query('start_time') start_time: string,
  //   @Query('end_time') end_time: string,
  //   @Query('status') status: string
  // ) {

  //   return this.timeSlot.getAvailableTimeSlot(start_time, end_time, status);
  // }

  @Get()
  async getAllSchuldes(
    @Query("start_time") start_time: string,
    @Query("end_time") end_time: string,
    @Query("is_available") is_available: string
  ) {
    try {
      console.log(start_time,end_time)
      return this.schedule.getAllSchedulesByDate(start_time,end_time,is_available);
    } catch (error) {
      console.log(error)
    }
  }
}
