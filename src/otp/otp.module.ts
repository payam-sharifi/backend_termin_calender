import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { PrismaModule } from 'prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SmsModule } from 'src/sms/sms.module';
import { OtpController } from './otp.controller';

@Module({
  imports:[SmsModule,PrismaModule,ScheduleModule.forRoot()],
  controllers:[OtpController],
  providers: [OtpService],
  exports:[OtpModule]
})
export class OtpModule {}
