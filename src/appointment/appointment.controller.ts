import { Controller, Delete, Get, Post, Put } from "@nestjs/common";

@Controller("appointment")
export class AppointmentController {

  @Post()  
  createApppoinment() {}

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
