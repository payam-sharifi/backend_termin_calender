import { Body, Controller, Delete, Get, Post, Put } from "@nestjs/common";
import { CreateAppintmentDto } from "./Dtos/create-appointment.dtos";
import { AppointmentService } from "./appointment.service";

@Controller("appointment")
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}
  @Post()
  createApppoinment(dataRq: CreateAppintmentDto) {
    if (dataRq) return this.appointmentService.create(dataRq);
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
  getAllAppoinmentsByDate() {
    return this.appointmentService.getAllAppointments();
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
