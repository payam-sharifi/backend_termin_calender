import { RoleEnum, Sex } from "@prisma/client";
import {
  IsString,
  IsBoolean,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  Length,
  IsEnum,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Vorname des Benutzers', example: 'Ali' })
  @IsOptional()
  @IsString({ message: 'Der Name muss ein Text sein.' })
  name?: string;

  @ApiPropertyOptional({ description: 'Nachname des Benutzers', example: 'Rezaei' })
  @IsOptional()
  @IsString({ message: 'Der Nachname muss ein Text sein.' })
  family?: string;

  @ApiPropertyOptional({ description: 'E-Mail-Adresse des Benutzers', example: 'ali@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Die E-Mail-Adresse muss gültig sein.' })
  email?: string;

  @ApiPropertyOptional({ description: 'Telefonnummer des Benutzers (DE Format)', example: '+491234567890' })
  @IsOptional()
  @IsPhoneNumber('DE', {
    message: 'Die Telefonnummer muss eine gültige deutsche Nummer sein.',
  })
  phone?: string;

  @ApiPropertyOptional({ enum: Sex, description: 'Geschlecht des Benutzers', example: 'MALE' })
  @IsOptional()
  @IsEnum(Sex, { message: 'Das Geschlecht ist ungültig.' })
  sex?: Sex;

  @ApiPropertyOptional({ description: 'Passwort des Benutzers (5-12 Zeichen)', example: 'secure123' })
  @IsOptional()
  @IsString({ message: 'Das Passwort muss ein Text sein.' })
  @Length(5, 12, {
    message: 'Das Passwort muss zwischen 5 und 12 Zeichen lang sein.',
  })
  password?: string;

  @ApiPropertyOptional({ enum: RoleEnum, description: 'Rolle des Benutzers', example: 'PROVIDER' })
  @IsOptional()
  @IsEnum(RoleEnum, { message: 'Die Rolle ist ungültig.' })
  role?: RoleEnum;

  @ApiPropertyOptional({ description: 'Gibt an, ob der Benutzer verifiziert ist', example: true })
  @IsOptional()
  @IsBoolean({ message: 'Der Wert muss ein Wahrheitswert (true oder false) sein.' })
  is_verified?: boolean;
}
