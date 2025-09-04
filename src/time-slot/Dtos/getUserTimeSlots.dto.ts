// src/timeslot/Dtos/getUserTimeSlots.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsDateString, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetUserTimeSlotsDto {
  @ApiProperty({ required: true, description: "User ID" })
  @IsString()
  user_id: string;

  @ApiProperty({ required: false, description: "Start time filter (ISO string)" })
  @IsOptional()
  @IsDateString()
  start_time?: string;

  @ApiProperty({ required: false, description: "End time filter (ISO string)" })
  @IsOptional()
  @IsDateString()
  end_time?: string;

  @ApiProperty({ required: false, default: 1, description: "Page number" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({ required: false, default: 10, description: "Items per page" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;
}