import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, Length } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Sex, RoleEnum } from "@prisma/client";

export class UpdateAuthDto {
  @IsOptional()
  @IsString({ message: 'Der Vorname muss eine Zeichenkette sein.' })
  @ApiPropertyOptional({ example: "Ali" })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Der Nachname muss eine Zeichenkette sein.' })
  @ApiPropertyOptional({ example: "Müller" })
  family?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Die E-Mail-Adresse muss gültig sein.' })
  @ApiPropertyOptional({ example: "beispiel@email.de" })
  email?: string;

  @IsString({ message: 'Das Passwort muss eine Zeichenkette sein.' })
  @Length(5, 12, { message: 'Das Passwort muss zwischen 5 und 12 Zeichen lang sein.' })
  @ApiPropertyOptional({ example: "passwort123" })
  password: string;

  @IsOptional()
  //@IsPhoneNumber('DE', { message: 'Die Telefonnummer muss eine gültige deutsche Nummer sein.' })
  @ApiPropertyOptional({ example: "+491234567890" })
  phone?: string;

  @IsOptional()
  @IsEnum(Sex, { message: 'Das Geschlecht muss entweder "MALE" oder "FEMALE" sein.' })
  @ApiPropertyOptional({ enum: Sex, example: "MALE" })
  sex?: Sex;

  @IsOptional()
  @IsEnum(RoleEnum, { message: 'Die Rolle ist ungültig.' })
  @ApiPropertyOptional({ enum: RoleEnum, example: "Customer" })
  role?: RoleEnum;
}
