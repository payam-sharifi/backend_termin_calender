import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [ScheduleController,PrismaService],
  providers: [ScheduleService]
})
export class ScheduleModule {}
