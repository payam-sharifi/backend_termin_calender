import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, TimeSlotEnum } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { CreateTimeSlotDto } from "./Dtos/createTimeSlots.dto";
import { GetTimeslotDto } from "./Dtos/getTimeslot.dtos";
import { SmsService } from "../sms/sms.service";
import { UpdateTimeSlotDto } from "./Dtos/updateTimeSlots.dto";
import { convertToBerlinTime } from "utils/time.util";
import { GetUserTimeSlotsDto } from "./Dtos/getUserTimeSlots.dto";

/** Parses slot bounds; throws BadRequestException if invalid or start >= end. */
function parseIntervalOrThrow(
  startRaw: string,
  endRaw: string
): { start: Date; end: Date } {
  const start = new Date(startRaw);
  const end = new Date(endRaw);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new BadRequestException(
      "Ungültiges Start- oder Enddatum. Erwartet wird ein gültiges Datum/Zeit-Format (z. B. ISO 8601)."
    );
  }
  if (start.getTime() >= end.getTime()) {
    throw new BadRequestException(
      "Die Startzeit muss vor der Endzeit liegen."
    );
  }
  return { start, end };
}

@Injectable()
export class TimeSlotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService
  ) {}

  /**
   * Any non-cancelled slot for this provider that overlaps [start, end) blocks booking.
   * Overlap: existing.start < newEnd AND existing.end > newStart (same rule as calendar UI).
   */
  async findOverlappingTimeSlotForProvider(
    providerId: string,
    start: Date,
    end: Date,
    excludeTimeSlotId?: string
  ) {
    return this.prisma.timeSlot.findFirst({
      where: {
        ...(excludeTimeSlotId ? { id: { not: excludeTimeSlotId } } : {}),
        status: { not: TimeSlotEnum.Cancelled },
        service: { provider_id: providerId },
        start_time: { lt: end },
        end_time: { gt: start },
      },
      select: { id: true, start_time: true, end_time: true },
    });
  }
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
      var costumerId: string | null = null;
      var serviceIdToUse: string;
      
      // If it's a self-reservation, get or create default service
      if (body.is_self_reservation && body.provider_id) {
        const defaultServiceTitle = `___SELF_RESERVATION___${body.provider_id}`;
        let defaultService = await this.prisma.service.findFirst({
          where: {
            title: defaultServiceTitle,
            provider_id: body.provider_id,
          },
        });
        
        if (!defaultService) {
          // Create default service for self-reservation
          defaultService = await this.prisma.service.create({
            data: {
              provider_id: body.provider_id,
              title: defaultServiceTitle,
              duration: 30, // Default duration
              is_active: true,
              price: 0,
              description: "Default service for self-reservation",
              color: "#9B59B6", // Purple color for self-reservation
            },
          });
        }
        
        serviceIdToUse = defaultService.id;
        costumerId = body.provider_id; // Use provider_id as customer_id for self-reservation
      } else {
        // For regular reservations, service_id is required
        if (!body.service_id) {
          throw new NotFoundException("Service ID is required for non-self reservations");
        }
        serviceIdToUse = body.service_id;
        // If it's not a self-reservation, handle customer creation
        if (!body.customer_id) {
          // Only create customer if it's not a self-reservation
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
        } else {
          costumerId = body.customer_id;
        }
      }

      const { start, end } = parseIntervalOrThrow(body.start_time, body.end_time);
      const serviceRow = await this.prisma.service.findUnique({
        where: { id: serviceIdToUse },
        select: { provider_id: true },
      });
      if (!serviceRow) {
        throw new NotFoundException("Dienst nicht gefunden.");
      }
      const clash = await this.findOverlappingTimeSlotForProvider(
        serviceRow.provider_id,
        start,
        end
      );
      if (clash) {
        throw new ConflictException(
          "Dieser Zeitraum überschneidet sich mit einem bestehenden Termin. Bitte wählen Sie eine andere Zeit."
        );
      }

      const slot = await this.prisma.timeSlot.create({
        data: {
          start_time: body.start_time,
          end_time: body.end_time,
          service_id: serviceIdToUse,
          status: TimeSlotEnum.Available,
          customer_id: costumerId,
          desc: body.desc || "",
        },
      });
     

      //  const text = `Hallo ${body.name}, Ihr Termin wurde erstellt: `;
       // await this.smsService.sendTwilioSms(body.phone, text);
      
      return { slot };
    } catch (error) {
      throw error;
    }
  }

  async updateTimeSlotsTimeById(id: string, dataRq: UpdateTimeSlotDto) {
    const existing = await this.prisma.timeSlot.findUnique({
      where: { id },
      include: { service: true },
    });
    if (!existing) {
      throw new NotFoundException(
        "Dienst nicht gefunden oder bereits gelöscht."
      );
    }

    const serviceId = dataRq.service_id ?? existing.service_id;
    const service =
      serviceId === existing.service_id
        ? existing.service
        : await this.prisma.service.findUnique({
            where: { id: serviceId },
          });
    if (!service) {
      throw new NotFoundException("Dienst nicht gefunden.");
    }

    const { start, end } = parseIntervalOrThrow(
      dataRq.start_time,
      dataRq.end_time
    );
    const clash = await this.findOverlappingTimeSlotForProvider(
      service.provider_id,
      start,
      end,
      id
    );
    if (clash) {
      throw new ConflictException(
        "Dieser Zeitraum überschneidet sich mit einem bestehenden Termin. Bitte wählen Sie eine andere Zeit."
      );
    }

    const starttime = convertToBerlinTime(dataRq.start_time);
    const res = await this.prisma.timeSlot.update({
      where: { id },
      data: {
          start_time:dataRq.start_time,
          end_time:dataRq.end_time,
          service_id:dataRq.service_id,
         
      },

    }
  
  );
  if(res){
    
 // const text = `${dataRq.name &&("Hallo" +" "+ dataRq.name)}, Ihr Termin wurde erstellt: ${starttime}`;
// const smssent= await this.smsService.sendTwilioSms(dataRq.phone, text);
 return true  
}  
return false
}



  async deleteTimeSlotsById(id: string, phone: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.appointment.deleteMany({ where: { time_slot_id: id } });
        await tx.timeSlot.delete({ where: { id } });
      });
      // const text = `Ihr Termin wurde abgesagt.`;
      // const smssent= await this.smsService.sendTwilioSms(phone, text);
      return true;
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundException(
          "Dienst nicht gefunden oder bereits gelöscht."
        );
      }
      throw error;
    }
  }
  async getUserTimeSlots(query: GetUserTimeSlotsDto) {
    const { 
      user_id, 
      start_time, 
      end_time, 
     
    } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: Prisma.TimeSlotWhereInput = {
      customer_id: user_id,
    };

    // Add time filters if provided
    if (start_time) {
      where.start_time = {
        gte: new Date(start_time),
      };
    }

    if (end_time) {
      where.end_time = {
        lte: new Date(end_time),
      };
    }

    // Get total count for pagination
    const total = await this.prisma.timeSlot.count({
      where,
    });

    // Get paginated results
    const timeSlots = await this.prisma.timeSlot.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        start_time: 'asc',
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            duration: true,
            price: true,
            color: true,
            description: true,
          },
        },
      },
    });

    return {
      data: timeSlots,
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
