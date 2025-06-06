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

//   @Get()
//   async getAllSchuldes(@Query('start_time') start_time:string,) {
//     return date
//     //this.schedule.getAllSchedulesBYDate(date)
//   }
}
