import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAppintmentDto } from './Dtos/create-appointment.dtos';

@Injectable()
export class AppointmentService {

    constructor(private readonly prisma: PrismaService) {}

    async isUserExist(id: string) {
      const isExist = await this.prisma.user.findFirst({
        where: { id },
      });
      if (isExist) return false;
      true;
    }
  
    //create Appointment/
    async create(dataRq: CreateAppintmentDto) {
      //must refactor
    //   const isUser = await this.prisma.appointment.findFirst({
    //     where: { email: dataRq.email, phone: dataRq.phone },
    //   });
    //   if (isUser) return "user already exist";
    //   const user = await this.prisma.user.create({
    //     data: {
    //       name: dataRq.name,
    //       family: dataRq.family,
    //       phone: dataRq.phone,
    //       password: dataRq.password,
    //       sex: dataRq.sex,
    //       role: dataRq.role,
    //       is_verified: dataRq.is_verified,
    //       email: dataRq.email,
    //     },
    //   });
    //   return user;
    }
}
