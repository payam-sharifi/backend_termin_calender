import { Module } from '@nestjs/common';
import { TimeSlotService } from './timeslot.service';
import { TimeSlotController } from './timeslot.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { SmsModule } from 'src/sms/sms.module';


@Module({
  providers: [TimeSlotService],
  controllers: [TimeSlotController],
  imports:[ScheduleModule,PrismaModule,SmsModule]
})
export class TimeSlotModule {}
