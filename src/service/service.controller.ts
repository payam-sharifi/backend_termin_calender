import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";
import { CreateServiceDto } from "./Dtos/create-service";
import { ServiceService } from "./service.service";
import { Prisma } from "@prisma/client";
import { UpdateServiceDto } from "./Dtos/update-service";

@Controller("service")
export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  //create service
  @Post()
  async createService(@Body() body: CreateServiceDto) {
    if (body) {
      const IsServiceExist = await this.service.isServiceExist(body);
      if (IsServiceExist) return "service with this title already exist";
      const createNewService = await this.service.create(body);
      return [createNewService, "Service has Created"];
    } else {
      return "body is empty";
    }
  }

  //getAllService
  @Get()
  async getAllService() {
    const services = await this.service.getAllServices();
    if (!services) return "NO SERVICES REGISTER YET";
    return services;
  }

  //getAllServiceWithProvider_id
  @Get("/:id")
  async getAllServiceWithProvider_id(@Param("id", ParseIntPipe) id: number) {
    const servicesByProvider =
      await this.service.getAllServicesWithProviderId(id);
    if (!servicesByProvider) return `NO SERVICES REGISTER YET FOR ${id}`;
    return servicesByProvider;
  }

  @Put("/:id")
  async updateServiceById(
    @Body() body: UpdateServiceDto,
    @Param("id", ParseIntPipe) id: number
  ) {
    const updateByProvider = await this.service.updateWithProviderId(id, body);
    if (!updateByProvider)
      return `service not Updated maybe is not exist or deleted`;
    return [updateByProvider, "service successfully updated"];
  }

  @Put("date")
  updateServiceByDate() {}

  @Delete(":id")
  deleteServiceById() {}

  @Delete("date")
  deleteServiceByDate() {}
}
