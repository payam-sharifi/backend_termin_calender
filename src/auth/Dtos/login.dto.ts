import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Length, ValidateIf, IsPhoneNumber } from "class-validator";

export class LoginUserDto {
  @ApiProperty({ example: "example@email.com", required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: "+491234567890" })
  @ValidateIf(o => !o.email) 
  @IsPhoneNumber("DE", { message: "Die Telefonnummer muss eine gültige deutsche Nummer sein." })
  phone: string;


  @ApiProperty({ example: "password123" })
  @IsString({ message: "Das Passwort muss eine Zeichenkette sein." })
  @Length(5, 12, { message: "Das Passwort muss zwischen 5 und 12 Zeichen lang sein." })
  password?: string;
}
