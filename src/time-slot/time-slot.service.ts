import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TimeSlotService {
constructor(private readonly prisma:PrismaService){}
async getAvailableTimeSlot(start_time:string,end_time:string,status){
    const available=this.prisma.timeSlot.findMany({
        where: {
          status,
          start_time,
          end_time
        }
      });
}
}
