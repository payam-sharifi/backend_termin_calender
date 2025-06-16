import { ApiProperty } from "@nestjs/swagger";
import { RoleEnum, Sex } from "@prisma/client";
import { IsEmail, IsOptional, IsString,} from "class-validator";

export class LoginUserDto {
  @ApiProperty({ example: "example@Email.com" })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ example: "00491574434333" })
  @IsString()
  phone: string;
  @ApiProperty({ example: "password123" })
  @IsString()
  password: string;
}
