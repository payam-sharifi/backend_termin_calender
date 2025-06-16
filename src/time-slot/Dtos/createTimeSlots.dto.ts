import { TimeSlotEnum } from "@prisma/client";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTimeSlotDto {
  @ApiPropertyOptional({ description: 'Optional schedule ID', type: Number })
  @IsOptional()
  @IsNumber({}, { message: 'Die Planungs-ID muss eine Zahl sein.' })
  schedule_id?: number;

  @ApiProperty({ description: 'Startzeit des Zeitfensters', example: '2025-06-15T10:00:00Z' })
  @IsString({ message: 'Die Startzeit muss eine Zeichenkette sein.' })
  start_time: string;

  @ApiProperty({ description: 'Dienst-ID für dieses Zeitfenster', example: 'uuid-string-here' })
  @IsString({ message: 'Die Dienst-ID muss eine Zeichenkette sein.' })
  service_id: string;

  @ApiProperty({ description: 'Endzeit des Zeitfensters', example: '2025-06-15T11:00:00Z' })
  @IsString({ message: 'Die Endzeit muss eine Zeichenkette sein.' })
  end_time: string;

  @ApiPropertyOptional({
    description: 'Status des Zeitfensters',
    enum: TimeSlotEnum,
    example: "AVAILABLE",
  })
  @IsOptional()
  @IsEnum(TimeSlotEnum, { message: 'Der Zeitfensterstatus ist ungültig.' })
  status?: TimeSlotEnum;
}
