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

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Der Name muss ein Text sein.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Der Nachname muss ein Text sein.' })
  family?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Die E-Mail-Adresse muss gültig sein.' })
  email?: string;

  @IsOptional()
  @IsPhoneNumber('DE', {
    message: 'Die Telefonnummer muss eine gültige deutsche Nummer sein.',
  })
  phone?: string;

  @IsOptional()
  @IsEnum(Sex, { message: 'Das Geschlecht ist ungültig.' })
  sex?: Sex;

  @IsOptional()
  @IsString({ message: 'Das Passwort muss ein Text sein.' })
  @Length(5, 12, {
    message: 'Das Passwort muss zwischen 5 und 12 Zeichen lang sein.',
  })
  password?: string;

  @IsOptional()
  @IsEnum(RoleEnum, { message: 'Die Rolle ist ungültig.' })
  role?: RoleEnum;

  @IsOptional()
  @IsBoolean({ message: 'Der Wert muss ein Wahrheitswert (true oder false) sein.' })
  is_verified?: boolean;
}
