import { Body, Controller, Delete, Get, Post, Put } from "@nestjs/common";
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
  getAllAppoinmentsByDateAndId(@Body() body:GetAppintmentDto) {
    try {
      if(body)return this.appointmentService.getAllAppointments(body);
      return "you sent empty information"
    } catch (error) {
     console.log(error) 
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
