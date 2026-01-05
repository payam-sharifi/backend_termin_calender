import { Body, Controller, Delete, Get, Post, Put, Query } from "@nestjs/common";
import { CreateAppintmentDto } from "./Dtos/create-appointment.dtos";
import { AppointmentService } from "./appointment.service";
import { GetAppintmentDto } from "./Dtos/get-appointment.dtos";

@Controller("appointment")
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}
  @Post()
  createApppoinment(@Body() body: CreateAppintmentDto) {
    console.log(body,"CreateAppintmentDto")
    if (body) return this.appointmentService.create(body);
    return "you send empty data";
  }

  // @Get()
  // async AvailableTimeSlot(
  //   @Query('start_time') start_time: string,
  //   @Query('end_time') end_time: string,
  //   @Query('status') status: string 
  // ) {
   
  //   return this.timeSlot.getAvailableTimeSlot(start_time, end_time, status);
  // }

  @Get()
  getAllAppoinmentsByDateAndId(@Query() query: GetAppintmentDto) {
    try {
      return this.appointmentService.getAllAppointments(query);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get("date")
  getAppoinmentByDate() {}

  @Get(":id")
  getAppontmentById() {}

  @Put("id")
  updateApppoinmentById() {}

  @Put("date")
  updateApppoinmentByDate() {}

  @Delete(":id")
  deleteApppoinmentById() {}

  @Delete("date")
  deleteApppoinmentByDate() {}
}
