import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { PrismaModule } from 'prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports:[PrismaModule,ScheduleModule.forRoot()],
  providers: [OtpService],
  exports:[OtpModule]
})
export class OtpModule {}
