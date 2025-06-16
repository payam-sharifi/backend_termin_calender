import { TimeSlotEnum } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetTimeslotDto {
  @ApiPropertyOptional({ description: "Service ID (foreign key to schedule)", example: "uuid-string" })
  @IsOptional()
  @IsString()
  service_id?: string;

  @ApiProperty({ description: "Start time in ISO format", example: "2025-06-15T08:00:00Z" })
  @IsString()
  start_time: string;

  @ApiProperty({ description: "End time in ISO format", example: "2025-06-15T09:00:00Z" })
  @IsString()
  end_time: string;

  @ApiProperty({ description: "Status of time slot", enum: TimeSlotEnum, example: "Available" })
  @IsEnum(TimeSlotEnum)
  status: TimeSlotEnum;
}
