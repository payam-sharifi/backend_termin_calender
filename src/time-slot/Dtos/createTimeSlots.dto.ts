import { Service, Sex, TimeSlotEnum } from "@prisma/client";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTimeSlotDto {
  @ApiPropertyOptional({ description: 'Optional schedule ID', type: Number })
  @IsOptional()
  @IsNumber({}, { message: 'Die Planungs-ID muss eine Zahl sein.' })
  schedule_id?: number;

  @ApiPropertyOptional({ description: 'Optional customer_id', type: String })
  @IsOptional()
  @IsString()
  customer_id: string;



  @ApiProperty({ example: "name" })
  @IsOptional()
  @IsString({ message: 'Der Name muss ein Text sein.' })
  name: string;

  @ApiProperty({ example: "family" })
  @IsOptional()
  @IsString({ message: 'Der Nachname muss ein Text sein.' })
  family: string;

  @ApiProperty({ example: "example@email.com" })
  @IsOptional()
  @IsEmail({}, { message: 'Die E-Mail-Adresse muss gültig sein.' })
  email: string;

  @ApiProperty({ example: "+491234567890" })
  @IsOptional()
  //@IsPhoneNumber('DE', { message: 'Die Telefonnummer muss eine gültige deutsche Nummer sein.' })
  phone: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'Der Wert muss ein Wahrheitswert (true oder false) sein.' })
  is_verified?: boolean;

  @ApiProperty({ example: "male" })
  @IsOptional()
  @IsString({ message: 'Das Geschlecht muss ein TEXT sein.' })
  sex: Sex;

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


  @ApiProperty({ description: 'Endzeit des Zeitfensters', example: '2025-06-15T11:00:00Z' })
  @IsOptional()
  @IsString({ message: 'Die Endzeit muss eine Zeichenkette sein.' })
  desc?: string;
}
