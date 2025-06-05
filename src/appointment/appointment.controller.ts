import { Controller, Delete, Get, Post, Put } from "@nestjs/common";
import { CreateAppintmentDto } from "./Dtos/create-appointment.dtos";
import { AppointmentService } from "./appointment.service";


@Controller("appointment")
export class AppointmentController {
constructor(private readonly appointmentService:AppointmentService){}
  @Post()  
  createApppoinment(dataRq:CreateAppintmentDto) {
    const IsAppointment=this.appointmentService.create(dataRq)
  }

  @Get()
  getAllAppoinment() {}

  @Get('date')
  getAppoinmentByDate() {}

  @Get(':id')
  getAppontmentById() {}

  @Put('id')
  updateApppoinmentById() {}

  @Put('date')
  updateApppoinmentByDate() {}

  @Delete(":id")
  deleteApppoinmentById() {}

  @Delete('date')
  deleteApppoinmentByDate() {}
}
