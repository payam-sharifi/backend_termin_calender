import { Module } from '@nestjs/common';
import { TimeSlotService } from './timeslot.service';
import { TimeSlotController } from './timeslot.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { ScheduleModule } from 'src/schedule/schedule.module';


@Module({
  providers: [TimeSlotService],
  controllers: [TimeSlotController],
  imports:[ScheduleModule,PrismaModule]
})
export class TimeSlotModule {}
