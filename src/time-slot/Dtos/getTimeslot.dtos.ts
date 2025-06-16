import { TimeSlotEnum } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetTimeslotDto {
  @ApiPropertyOptional({ description: "Dienst-ID (Fremdschlüssel zu Schedule)", example: "uuid-string" })
  @IsOptional()
  @IsString({ message: 'Die Dienst-ID muss eine Zeichenkette sein.' })
  service_id?: string;

  @ApiProperty({ description: "Startzeit im ISO-Format", example: "2025-06-15" })
  @IsString({ message: 'Die Startzeit muss im ISO-Format als Zeichenkette angegeben werden.' })
  start_time: string;

  @ApiProperty({ description: "Endzeit im ISO-Format", example: "2025-06-15" })
  @IsString({ message: 'Die Endzeit muss im ISO-Format als Zeichenkette angegeben werden.' })
  end_time: string;

  @ApiProperty({ description: "Status des Zeitfensters", enum: TimeSlotEnum, example: "AVAILABLE" })
  @IsEnum(TimeSlotEnum, { message: 'Der Zeitfensterstatus ist ungültig. Zulässige Werte: AVAILABLE, UNAVAILABLE usw.' })
  status: TimeSlotEnum;
}
