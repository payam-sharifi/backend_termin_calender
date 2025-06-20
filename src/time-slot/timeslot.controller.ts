import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from "@nestjs/common";
import { TimeSlotService } from "./timeslot.service";
import { CreateTimeSlotDto } from "./Dtos/createTimeSlots.dto";

import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { GetTimeslotDto } from "./Dtos/getTimeslot.dtos";

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
}
