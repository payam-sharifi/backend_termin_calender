import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "../user/user.module";
import { ServiceModule } from "../service/service.module";
//import { ScheduleModule } from "../schedule/schedule.module";
import { AppointmentModule } from "src/appointment/appointment.module";
import { TimeSlotModule } from "src/time-slot/timeslot.module";
import { AuthModule } from "src/auth/auth.module";
import { ConfigModule } from '@nestjs/config';
import { SmsModule } from "src/sms/sms.module";
import { ScheduleModule } from '@nestjs/schedule';
import { ReminderModule } from "src/reminder/reminder.module";
import { OtpModule } from "src/otp/otp.module";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    UserModule,OtpModule, ReminderModule,ScheduleModule.forRoot(),ServiceModule, ScheduleModule,AppointmentModule,TimeSlotModule,AuthModule,SmsModule,OtpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
