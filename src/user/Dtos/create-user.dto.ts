import { ApiProperty } from "@nestjs/swagger";
import { RoleEnum, Sex } from "@prisma/client";
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEmail,
  Length,
  IsPhoneNumber,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "name" })
  @IsString({ message: 'Der Name muss ein Text sein.' })
  name: string;

  @ApiProperty({ example: "family" })
  @IsString({ message: 'Der Nachname muss ein Text sein.' })
  family: string;

  @ApiProperty({ example: "example@email.com" })
  @IsOptional()
  @IsEmail({}, { message: 'Die E-Mail-Adresse muss gültig sein.' })
  email?: string | null ;

  @ApiProperty({ example: "+491234567890" })
  //@IsPhoneNumber('DE', { message: 'Die Telefonnummer muss eine gültige deutsche Nummer sein.' })
  phone: string;

  @ApiProperty({ example: "1234", required: false })
  @IsOptional()
  @IsString()
  code?: string; // Optional - no longer required for registration
  
  @ApiProperty({ example: "male" })
  @IsOptional()
  @IsString({ message: 'Das Geschlecht muss ein TEXT sein.' })
  sex: Sex;

  @ApiProperty({ example: "password123" })
  @IsOptional()
  @IsString()
  @Length(5, 12, {
    message: 'Das Passwort muss zwischen 5 und 12 Zeichen lang sein.',
  })
  password: string;

  @ApiProperty({ example: "Customer" })
  @IsOptional()
  @IsString({ message: 'Die Rolle muss ein Text sein.' })
  role: RoleEnum;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'Der Wert muss ein Wahrheitswert (true oder false) sein.' })
  is_verified: true;
}
