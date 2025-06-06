import { Module } from '@nestjs/common';
import { TimeSlotService } from './time-slot.service';
import { TimeSlotController } from './time-slot.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { ScheduleModule } from 'src/schedule/schedule.module';


@Module({
  providers: [TimeSlotService],
  controllers: [TimeSlotController],
  imports:[ScheduleModule,PrismaModule]
})
export class TimeSlotModule {}
