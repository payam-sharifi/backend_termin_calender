import { Body, Controller, Post } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './Dtos/create.schedule.dtos';

@Controller('schedule')
export class ScheduleController {
constructor(private readonly schedule:ScheduleService){}
@Post()
async createSchedule(@Body() body:CreateScheduleDto){
    const schedules=await this.schedule.createManySchedules(body)
    return schedules
}

    
}
