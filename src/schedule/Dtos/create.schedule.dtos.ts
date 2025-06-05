import { DaysOfweeksEnum } from "@prisma/client";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateScheduleDto {
  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsBoolean()
  is_available: boolean;

  @IsString()
  day_of_week: DaysOfweeksEnum;

  @IsNumber()
  provider_id: string;
}
