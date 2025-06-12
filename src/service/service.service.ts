import { Injectable } from "@nestjs/common";
import { CreateServiceDto } from "./Dtos/create-service.dto";
import { PrismaService } from "prisma/prisma.service";
import { UpdateServiceDto } from "./Dtos/update-service.dto";
import { DeleteServiceDto } from "./Dtos/delete-service.dto";
import { GetServiceDto } from "./Dtos/get-services.dto";

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  //check if service already exist
  async isServiceExist(dataRq: CreateServiceDto) {
    const isServiceExist = await this.prisma.service.findFirst({
      where: { title: dataRq.title, provider_id: dataRq.provider_id },
    });
    if (isServiceExist) return true;
    return false;
  }

  //check if service already exist
  async isServiceByIdExist(id: string) {
    const isServiceExist = await this.prisma.service.findFirst({
      where: { id },
    });
    if (isServiceExist) return true;
    return false;
  }
  //create new service
  async create(dataRq: CreateServiceDto) {
    const CreateService = await this.prisma.service.create({
      data: {
        provider_id: dataRq.provider_id,
        title: dataRq.title,
        duration: dataRq.duration,
        is_active: dataRq.is_active,
        price: dataRq.price || 0,
        description: dataRq.description || "",
      },
    });
    return CreateService;
  }

  //getAllServices
  async getAllServices() {
    return await this.prisma.service.findMany({
      relationLoadStrategy: "join",
      include: {
        timeSlots: true,
      },
    });
  }

  async getAllServicesWithProviderId(body:GetServiceDto) {
    const startDateTime = new Date(`${body.start_time}T00:00:00.000Z`);
    const endDateTime = new Date(new Date(body.end_time));
    endDateTime.setDate(endDateTime.getDate() + 1);
    return await this.prisma.service.findMany({
      relationLoadStrategy: "join",
      where: {
        provider_id: body.provider_id,
      },
      include: {
        timeSlots: {
          where: {
            start_time: {
              gte:startDateTime //new Date(start_date),
            },
            end_time: {
              lte: endDateTime//new Date(end_date),
            },
          },
        },
      },
    });
  }
  

  async updateWithProviderId(id: string, dataRq: UpdateServiceDto) {
    return await this.prisma.service.update({
      where: {
        id,
      },
      data: {
        title: dataRq.title,
        description: dataRq.description,
        duration: dataRq.duration,
        is_active: dataRq.is_active,
        price: dataRq.price,
        provider_id: dataRq.provider_id,
      },
    });
  }

  async deleteServiceById(id: string) {
    return await this.prisma.service.delete({
      where: { id },
    });
  }

  async deleteServiceByTitle(body: DeleteServiceDto) {
    return await this.prisma.service.deleteMany({
      where: { title: body.title },
    });
  }
}
