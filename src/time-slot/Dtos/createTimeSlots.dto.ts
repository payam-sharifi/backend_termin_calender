import { TimeSlotEnum } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTimeSlotDto {
  @ApiPropertyOptional({ description: 'Optional schedule ID', type: Number })
  @IsOptional()
  @IsString()
  schedule_id?: number;

  @ApiProperty({ description: 'Start time of the time slot', example: '2025-06-15T10:00:00Z' })
  @IsString()
  start_time: string;

  @ApiProperty({ description: 'Service ID associated with this time slot', example: 'uuid-string-here' })
  @IsString()
  service_id: string;

  @ApiProperty({ description: 'End time of the time slot', example: '2025-06-15T11:00:00Z' })
  @IsString()
  end_time: string;

  @ApiPropertyOptional({ description: 'Status of the time slot', enum: TimeSlotEnum, example: "AVAILABLE" })
  @IsOptional()
  @IsEnum(TimeSlotEnum)
  status?: TimeSlotEnum;
}
