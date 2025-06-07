import { Injectable } from "@nestjs/common";
import { TimeSlotEnum } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class TimeSlotService {
  constructor(private readonly prisma: PrismaService) {}
  async getAvailableTimeSlot(start_time: string, end_time: string, status?:any) {
    return this.prisma.timeSlot.findMany({
      relationLoadStrategy: 'join',
      where: {
        status,
        start_time: new Date(start_time),
        end_time:new Date(end_time)
      },
      include: {
        schedule: true,
        Appointment:true
      },
    });
  }
}
