import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';
import { PrismaService } from 'prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  providers: [ReminderService,PrismaService],
  controllers: [ReminderController],
  imports:[SmsModule,ScheduleModule.forRoot(),]
})
export class ReminderModule {}
