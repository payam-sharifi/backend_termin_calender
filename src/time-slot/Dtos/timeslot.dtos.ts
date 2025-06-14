import { Appointment, Schedule, TimeSlotEnum } from "@prisma/client";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class getTimeSlotsDto {
  @IsOptional()
  @IsString()
  service_Id: string; // ForeignKey to  (schedule)

  // @IsOptional()
  // @IsString()
  // user_Id: string;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsString()
  status: TimeSlotEnum;

  //Appointment: Appointment;
  //  schedule: Schedule;

  // @Query("user_Id") user_Id: string,
}
