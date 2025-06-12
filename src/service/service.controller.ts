import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { CreateServiceDto } from "./Dtos/create-service.dto";
import { ServiceService } from "./service.service";
import { UpdateServiceDto } from "./Dtos/update-service.dto";
import { GetServiceDto } from "./Dtos/get-services.dto";

@Controller("service")
export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  //create service
  @Post("/create")
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
  @Post()
  async getAllServiceWithProvider_id(@Body() body:GetServiceDto) {
   
    const servicesByProvider =
      await this.service.getAllServicesWithProviderId(body);
  
    if (!servicesByProvider) return null;
    return servicesByProvider;
  }

  @Put("/:id")
  async updateServiceById(
    @Body() body: UpdateServiceDto,
    @Param("id", ParseIntPipe) id: string
  ) {
    const updateByProvider = await this.service.updateWithProviderId(id, body);
    if (!updateByProvider)
      return `service not Updated maybe is not exist or deleted`;
    return [updateByProvider, "service successfully updated"];
  }

  @Put("date")
  updateServiceByDate() {}

  @Delete(":id")
  async deleteServiceById(@Param("id", ParseIntPipe) id: string) {
    const IsServiceExist = await this.service.isServiceByIdExist(id);
    if (!IsServiceExist) return "Service does not exist maybe already deleted";
    const deleteService = await this.service.deleteServiceById(id);
    return [deleteService, "service successfully updated "];
  }

  @Delete("date")
  deleteServiceByDate() {}
}
