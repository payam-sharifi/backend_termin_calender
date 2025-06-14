import { DaysOfweeksEnum } from "@prisma/client";
import { IsBoolean, IsString } from "class-validator";

export class CreateScheduleDto {
  
  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsBoolean()
  is_available: boolean;

  @IsString()
  day_of_week: DaysOfweeksEnum;

  @IsString()
  provider_id: string;
}
