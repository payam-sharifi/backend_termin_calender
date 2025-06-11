import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateAppintmentDto } from "./Dtos/create-appointment.dtos";
import { GetAppintmentDto } from "./Dtos/get-appointment.dtos";

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  //create Appointment/
  async create(dataRq: CreateAppintmentDto) {
    const appointment = await this.prisma.appointment.create({
      data: {
        customer_id: dataRq.customer_id,
        status: dataRq.status,
        notes: dataRq.notes,
        provider_id: dataRq.provider_id,
        service_id: dataRq.service_id,
        time_slot_id: dataRq.time_slot_id,
      },
    });

    return appointment;
  }

  async getAllAppointments(body: GetAppintmentDto) {
    return this.prisma.appointment.findMany({
      relationLoadStrategy: "join",
      include: {
        timeSlot: true,
      },
    });
  }
}
