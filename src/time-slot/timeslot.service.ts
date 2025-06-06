import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class TimeSlotService {
  constructor(private readonly prisma: PrismaService) {}
  async getAvailableTimeSlot(start_time: string, end_time: string, status) {
    console.log(new Date(start_time), new Date(end_time), status);
    return this.prisma.timeSlot.findMany({
      where: {
        status,
        start_time: new Date(start_time),
        end_time:new Date(end_time)
      },
    });
  }
}
