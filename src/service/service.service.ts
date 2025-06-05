import { Injectable } from "@nestjs/common";
import { CreateServiceDto } from "./Dtos/create-service.dto";
import { PrismaService } from "prisma/prisma.service";
import { UpdateServiceDto } from "./Dtos/update-service.dto";
import { DeleteUserDto } from "src/user/Dtos";
import { DeleteServiceDto } from "./Dtos/delete-service.dto";

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
  async isServiceByIdExist(id: number) {
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
        description: dataRq.description,
      },
    });
    return CreateService;
  }

  //getAllServices
  async getAllServices() {
    return await this.prisma.service.findMany();
  }

  async getAllServicesWithProviderId(id: number) {
    return await this.prisma.service.findMany({ where: { provider_id: id } });
  }

  async updateWithProviderId(id: number, dataRq: UpdateServiceDto) {
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

  async deleteServiceById(id: number) {
    return await this.prisma.service.delete({
      where: { id },
    });
  }

  async deleteServiceByTitle(body:DeleteServiceDto) {
     return await this.prisma.service.deleteMany({
       where: { title:body.title },
     });
   }
}
