import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  providers: [AppointmentService],
  controllers: [AppointmentController],
  imports:[PrismaModule]
})
export class AppointmentModule {}
