import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateScheduleDto } from './Dtos/create.schedule.dtos';

@Injectable()
export class ScheduleService {
constructor(private readonly prisma:PrismaService){}

    async createManySchedules(body:CreateScheduleDto){
        const createSchedules= await this.prisma.schedule.createMany({
            data:[
                {},
                {},
                {}
            ]
        })
    }
}
