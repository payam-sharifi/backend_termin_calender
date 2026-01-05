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
    // Add pagination and filters for better performance
    const page = Number(body.page) || 1;
    const limit = Number(body.limit) || 50; // Default limit to prevent loading all data
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Add filters if provided
    if (body.provider_id) {
      where.provider_id = body.provider_id;
    }
    if (body.customer_id) {
      where.customer_id = body.customer_id;
    }
    if (body.status) {
      where.status = body.status;
    }

    // Use transaction for count and data to ensure consistency
    const [appointments, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        relationLoadStrategy: "join",
        where,
        include: {
          timeSlot: {
            select: {
              id: true,
              start_time: true,
              end_time: true,
              status: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc', // Most recent first
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}
