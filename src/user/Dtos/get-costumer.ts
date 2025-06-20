import { RoleEnum, Sex } from "@prisma/client";
import { IsString, IsBoolean, IsEnum, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetCustomerDto {
  @ApiPropertyOptional({ description: 'Vorname des Kunden', example: 'Ali' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Nachname des Kunden', example: 'Rezaei' })
  @IsOptional()
  @IsString()
  family?: string;

  @ApiPropertyOptional({ description: 'E-Mail des Kunden', example: 'user@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Telefonnummer des Kunden', example: '+49123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: Sex, description: 'Geschlecht des Kunden', example: 'MALE' })
  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @ApiPropertyOptional({ enum: RoleEnum, description: 'Rolle des Kunden', example: 'CUSTOMER' })
  @IsOptional()
  @IsEnum(RoleEnum)
  role?: RoleEnum;

  @ApiPropertyOptional({ description: 'Ist der Kunde verifiziert?', example: true })
  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}
