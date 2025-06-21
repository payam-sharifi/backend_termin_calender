import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { TimeSlotService } from "./timeslot.service";
import { CreateTimeSlotDto } from "./Dtos/createTimeSlots.dto";

import { ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { GetTimeslotDto } from "./Dtos/getTimeslot.dtos";
import { UpdateTimeSlotDto } from "./Dtos/updateTimeSlots.dto";

@Controller("timeslot")
export class TimeSlotController {
  constructor(private readonly timeSlot: TimeSlotService) {}
  @Get()
  async AvailableTimeSlot(@Body() body: GetTimeslotDto) {
    return this.timeSlot.getAvailableTimeSlot(body);
  }

  @Post()
  @ApiOperation({ summary: "Create new time slots" })
  @ApiBody({ type: CreateTimeSlotDto })
  @ApiResponse({ status: 201, description: "Zeitfenster erfolgreich erstellt" })
  @ApiResponse({ status: 400, description: "Bad Request: Request body is empty." })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  async createTimeSlots(@Body() body: CreateTimeSlotDto) {
    if (!body || Object.keys(body).length === 0) {
      throw new HttpException(
        "Request body is empty",
        HttpStatus.BAD_REQUEST
      );
    }
    try {
      const res = await this.timeSlot.createTimeSlots(body);
      return {
        statusCode: HttpStatus.CREATED,
        message: "Zeitfenster erfolgreich erstellt",
        data: res,
      };
    } catch (error) {
      console.error("Error creating time slot:", error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Zeitfenster konnte nicht erstellt werden",
          error: error?.message || error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: "update time of event" })
  @ApiBody({ type: UpdateTimeSlotDto })
  @ApiResponse({ status: 201, description: "Zeitfenster erfolgreich erstellt" })
  @ApiResponse({ status: 400, description: "Bad Request: Request body is empty." })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  async updateTimeSlotsTimeById( @Param('id') id: string,@Body() body: UpdateTimeSlotDto,){
    try {
      const updated = await this.timeSlot.updateTimeSlotsTimeById(id, body);
      return {
        success: true,
        message: 'Dienst erfolgreich aktualisiert',
        data: updated,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Dienst nicht gefunden oder bereits gelöscht.');
      }
      throw error;
    }
  }



  @Delete(":id")
  @ApiOperation({ summary: 'Delete a service by ID' })
  @ApiOkResponse({ description: 'Dienst erfolgreich gelöscht.' })
  @ApiNotFoundResponse({ description: 'Event not found or already deleted.' })
  async deleteServiceById(@Param("id") id: string) {
    const deletedTimeSlot = await this.timeSlot.deleteTimeSlotsById(id);
    return {
      success: true,
      message: "Dienst erfolgreich gelöscht.",
      data: deletedTimeSlot,
    };
  }
}
