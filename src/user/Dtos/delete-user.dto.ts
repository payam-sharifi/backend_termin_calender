import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsPhoneNumber, IsString } from "class-validator";

export class DeleteUserDto {
  @ApiProperty({ example: "example@email.com" })
  @IsEmail({}, { message: "Die E-Mail-Adresse muss gültig sein." })
  email: string;
  @ApiProperty({ example: "+491234567890" })
  @IsPhoneNumber("DE", {
    message: "Die Telefonnummer muss eine gültige deutsche Nummer sein.",
  })
  phone: string;
}
