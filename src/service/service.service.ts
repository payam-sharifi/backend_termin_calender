import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateServiceDto } from "./Dtos/create-service.dto";
import { PrismaService } from "prisma/prisma.service";
import { UpdateServiceDto } from "./Dtos/update-service.dto";

import { GetServiceDto } from "./Dtos/get-services.dto";

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  //check if service already exist
  async isServiceExist(dataRq: CreateServiceDto) {
    const isServiceExist = await this.prisma.service.findFirst({
      where: {
        title: {
          equals: dataRq.title,
          mode: "insensitive",
        },
        provider_id: dataRq.provider_id,
      },
    });
    if (isServiceExist) return true;
    return false;
  }

  //create new service
  async create(dataRq: CreateServiceDto) {
    return await this.prisma.service.create({
      data: {
        provider_id: dataRq.provider_id,
        title: dataRq.title,
        duration: dataRq.duration,
        is_active: dataRq.is_active,
        price: dataRq.price ?? 0,
        description: dataRq.description ?? "",
        color: dataRq.color ?? "#ACB3D1",
      },
    });
  }

  //getAllServices without Slots
  async getAllServices(id:string) {
    return this.prisma.service.findMany({
      relationLoadStrategy: "join",
      where: {
        provider_id: id,
      },
      include:{
        user:{
          select:{name:true}
        }
      }
    });
  }

  //getAllServices with Slots
  async getAllServicesWithProviderId(body: GetServiceDto) {
    const startDateTime = new Date(`${body.start_time}T00:00:00.000Z`);
    const endDateTime = new Date(`${body.end_time}T23:59:59.999Z`);
    // Add 1 day to endDateTime to include the entire end date
    endDateTime.setUTCDate(endDateTime.getUTCDate() + 1);
    endDateTime.setUTCHours(0, 0, 0, 0);
    return await this.prisma.service.findMany({
      relationLoadStrategy: "join",
      where: {
        provider_id: body.provider_id,
      },
      include: {
        timeSlots: {
          where: {
            start_time: {
              gte: startDateTime,
              lt: endDateTime, // Use lt instead of lte with end_time check
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                family: true,
                email: true,
                phone: true,
                sex: true,
                is_verified: true,
              },
            },
          },
        },
      },
    });
  }


  async getAllServicesWithCostumerId(body: GetServiceDto) {
    const startDateTime = new Date(`${body.start_time}T00:00:00.000Z`);
    const endDateTime = new Date(`${body.end_time}T23:59:59.999Z`);
    // Add 1 day to endDateTime to include the entire end date
    endDateTime.setUTCDate(endDateTime.getUTCDate() + 1);
    endDateTime.setUTCHours(0, 0, 0, 0);
    return await this.prisma.service.findMany({
      relationLoadStrategy: "join",
      where: {
        provider_id: body.provider_id,
      },
      include: {
        timeSlots: {
          where: {
            start_time: {
              gte: startDateTime,
              lt: endDateTime, // Use lt instead of lte with end_time check
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                family: true,
                email: true,
                phone: true,
                sex: true,
                is_verified: true,
              },
            },
          },
        },
      },
    });
  }


  async updateWithProviderId(id: string, dataRq: UpdateServiceDto) {
    return await this.prisma.service.update({
      where: { id },
      data: {
        title: dataRq.title,
        description: dataRq.description,
        duration: dataRq.duration,
        is_active: dataRq.is_active,
        price: dataRq.price,
        provider_id: dataRq.provider_id,
        color: dataRq.color,
      },
    });
  }

  async deleteServiceById(id: string) {
    try {
      return await this.prisma.service.delete({
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
