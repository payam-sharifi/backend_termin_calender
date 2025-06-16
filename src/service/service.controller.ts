import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CreateServiceDto } from "./Dtos/create-service.dto";
import { ServiceService } from "./service.service";
import { UpdateServiceDto } from "./Dtos/update-service.dto";
import { GetServiceDto } from "./Dtos/get-services.dto";

@ApiTags('Service')
@Controller("service")
export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create a new service' })
  @ApiCreatedResponse({ description: 'Service has been created successfully.' })
  @ApiBadRequestResponse({ description: 'Request body is empty or invalid.' })
  @ApiConflictResponse({ description: 'Service with this title already exists.' })
  async createService(@Body() body: CreateServiceDto) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('Request body is empty');
    }
  
    const isServiceExist = await this.service.isServiceExist(body);
    if (isServiceExist) {
      throw new ConflictException('Service with this title already exists');
    }
  
    const createdService = await this.service.create(body);
    return {
      success: true,
      message: 'Service has been created',
      data: createdService,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all services without time slots' })
  @ApiOkResponse({ description: 'Services retrieved successfully.' })
  async getAllService() {
    const services = await this.service.getAllServices();
    if (!services || services.length === 0) {
      return {
        message: "No services registered yet",
        data: [],
      };
    }
    return services
  }

  @Post()
  @ApiOperation({ summary: 'Get all services by provider ID including time slots' })
  @ApiOkResponse({ description: 'Services retrieved successfully.' })
  async getAllServiceWithProvider_id(@Body() body:GetServiceDto) {
    const servicesByProvider = await this.service.getAllServicesWithProviderId(body);
    if (!servicesByProvider) return null;
    return servicesByProvider;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service by ID' })
  @ApiOkResponse({ description: 'Service successfully updated.' })
  @ApiNotFoundResponse({ description: 'Service not found or already deleted.' })
  async updateServiceById(
    @Param('id') id: string,
    @Body() body: UpdateServiceDto,
  ) {
    try {
      const updated = await this.service.updateWithProviderId(id, body);
      return {
        success: true,
        message: 'Service successfully updated',
        data: updated,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Service not found or already deleted.');
      }
      throw error;
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: 'Delete a service by ID' })
  @ApiOkResponse({ description: 'Service successfully deleted.' })
  @ApiNotFoundResponse({ description: 'Service not found or already deleted.' })
  async deleteServiceById(@Param("id") id: string) {
    const deletedService = await this.service.deleteServiceById(id);
    return {
      success: true,
      message: "Service successfully deleted.",
      data: deletedService,
    };
  }
}
