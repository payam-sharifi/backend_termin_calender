import { Injectable } from "@nestjs/common";
import { TimeSlotEnum } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { CreateTimeSlotDto } from "./Dtos/createTimeSlots.dto";
import { getTimeSlotsDto } from "./Dtos/timeslot.dtos";

@Injectable()
export class TimeSlotService {
  constructor(private readonly prisma: PrismaService) {}
  async getAvailableTimeSlot(body: getTimeSlotsDto) {
    return this.prisma.timeSlot.findMany({
      relationLoadStrategy: "join",
      where: {
        //  user_Id:body.user_Id,
        service_id: body.service_Id,
        start_time: new Date(body.start_time),
        end_time: new Date(body.end_time),
      },
      // include: {
      //   //schedule: true,
      //   Appointment: true,
      // },
    });
  }

  async createTimeSlots(body: CreateTimeSlotDto) {
     const slot=await this.prisma.timeSlot.create({
      data: {
        start_time: body.start_time,
        end_time: body.end_time,
        service_id: body.service_id,
        status: body.status,
      },
      
    });
    return slot
  }
}
