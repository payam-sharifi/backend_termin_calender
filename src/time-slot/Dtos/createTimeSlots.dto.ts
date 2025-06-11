import { Appointment, Schedule, TimeSlotEnum } from "@prisma/client";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTimeSlotDto {
  @IsOptional()
  @IsNumber()
  schedule_id: string; // ForeignKey to  (schedule)

  @IsString()
  start_time: string;

  @IsString()
  service_id: string;

  @IsString()
  end_time: string;

  @IsOptional()
  @IsString()
  status: TimeSlotEnum;
}
