import { Appointment, Schedule, TimeSlotEnum } from "@prisma/client";
import { IsNumber, IsString } from "class-validator";

export class CreateTimeSlotDto {
  @IsNumber()
  schedule_id: string; // ForeignKey to  (schedule)

  @IsString()
  start_time: string;
  
  @IsString()
  end_time: string;

  @IsString()
  status: TimeSlotEnum;

  //Appointment: Appointment;
//  schedule: Schedule;
}
