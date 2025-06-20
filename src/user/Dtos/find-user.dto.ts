import { RoleEnum, Sex } from "@prisma/client";
import { IsOptional, IsString, IsBoolean, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class FindUserDto {
  @ApiPropertyOptional({ description: 'Vorname des Benutzers', example: 'Ali' })
  @IsOptional()
  @IsString({ message: 'Der Name muss ein Text sein.' })
  name?: string;

  @ApiPropertyOptional({ description: 'Nachname des Benutzers', example: 'Rezaei' })
  @IsOptional()
  @IsString({ message: 'Der Nachname muss ein Text sein.' })
  family?: string;

  @ApiPropertyOptional({ description: 'E-Mail-Adresse des Benutzers', example: 'user@example.com' })
  @IsOptional()
  @IsString({ message: 'Die E-Mail-Adresse muss ein Text sein.' })
  email?: string;

  @ApiPropertyOptional({ description: 'Telefonnummer des Benutzers', example: '+491234567890' })
  @IsOptional()
  @IsString({ message: 'Die Telefonnummer muss ein Text sein.' })
  phone?: string;

  @ApiPropertyOptional({ enum: Sex, description: 'Geschlecht des Benutzers', example: 'MALE' })
  @IsOptional()
  @IsEnum(Sex, { message: 'Das Geschlecht muss ein gültiger Wert sein (MALE oder FEMALE).' })
  sex?: Sex;

  @ApiPropertyOptional({ enum: RoleEnum, description: 'Rolle des Benutzers', example: 'CUSTOMER' })
  @IsOptional()
  @IsEnum(RoleEnum, { message: 'Die Rolle muss ein gültiger Wert sein.' })
  role?: RoleEnum;

  @ApiPropertyOptional({ description: 'Ist der Benutzer verifiziert?', example: true })
  @IsOptional()
  @IsBoolean({ message: 'Der Wert muss ein Wahrheitswert (true oder false) sein.' })
  is_verified?: boolean;
}
