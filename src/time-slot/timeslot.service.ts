import { Injectable, NotFoundException } from "@nestjs/common";
import { TimeSlotEnum } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { CreateTimeSlotDto } from "./Dtos/createTimeSlots.dto";
import { GetTimeslotDto } from "./Dtos/getTimeslot.dtos";
import { SmsService } from "../sms/sms.service";
import { UpdateTimeSlotDto } from "./Dtos/updateTimeSlots.dto";
@Injectable()
export class TimeSlotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService
  ) {}
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
      var costumerId = "";
      if (!body.customer_id) {
        const customer = await this.prisma.user.create({
          data: {
            name: body.name,
            family: body.family,
            phone: body.phone,
            email: body.email,
            sex: body.sex,
            password: "",
            is_verified: true,
          },
        });
        costumerId = customer.id;
      }
      const slot = await this.prisma.timeSlot.create({
        data: {
          start_time: body.start_time,
          end_time: body.end_time,
          service_id: body.service_id,
          status: TimeSlotEnum.Available,
          customer_id: costumerId != "" ? costumerId : body.customer_id,
          desc: body.desc || "",
        },
      });
      const smsToCustomer = await this.prisma.user.findUnique({
        where: { id: costumerId || body.customer_id },
      });

      if (smsToCustomer?.phone) {
        const text = `Hallo ${smsToCustomer.name}, Ihr Termin wurde erstellt: ${slot.start_time.toLocaleString()}`;
        await this.smsService.sendTwilioSms(smsToCustomer?.phone, text);
      }
      return { slot };
    } catch (error) {
      throw error;
    }
  }


  async updateTimeSlotsTimeById(id: string, dataRq: UpdateTimeSlotDto) {
    return await this.prisma.timeSlot.update({
      where: { id },
      data: {
          start_time:dataRq.start_time,
          end_time:dataRq.end_time
      },
    });
  }
  async deleteTimeSlotsById(id: string) {
    try {
      return await this.prisma.timeSlot.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundException(
          "Dienst nicht gefunden oder bereits gelöscht."
        );
      }
      throw error;
    }
  }


}
