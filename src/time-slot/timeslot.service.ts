import { Injectable } from "@nestjs/common";
import { TimeSlotEnum } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { CreateTimeSlotDto } from "./Dtos/createTimeSlots.dto";
import { GetTimeslotDto } from "./Dtos/getTimeslot.dtos";

@Injectable()
export class TimeSlotService {
  constructor(private readonly prisma: PrismaService) {}
  async getAvailableTimeSlot(body: GetTimeslotDto) {
    return this.prisma.timeSlot.findMany({
      relationLoadStrategy: "join",
      where: {
        //  user_Id:body.user_Id,
        service_id: body.service_id,
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
   
    try {
      const slot = await this.prisma.timeSlot.create({
        data: {
          start_time: body.start_time,
          end_time: body.end_time,
          service_id: body.service_id,
          status: TimeSlotEnum.Available ,
          customer_id:body.customer_id,
          desc:body.desc || "",
          
        },
      });
      // const customer = await this.prisma.user.create({
      //   data: {
      //     name:body.name,
      //     family:body.family,
      //     phone:body.family,
      //     email:body.email,
      //     sex:body.sex,
      //     password:"",
      //     is_verified:body.is_verified!
      //   },
      // });

      return {slot};
    } catch (error) {
      throw error;
    }
  }
}
