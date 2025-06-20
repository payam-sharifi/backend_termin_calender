import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';
import { PrismaService } from 'prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  providers: [ReminderService,PrismaService],
  controllers: [ReminderController],
  imports:[ScheduleModule.forRoot(),]
})
export class ReminderModule {}
