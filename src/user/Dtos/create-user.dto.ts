import { ApiProperty } from "@nestjs/swagger";
import { RoleEnum, Sex } from "@prisma/client";
import {
  IsString,
  IsBoolean,
  IsEmpty,
  IsOptional,
  IsEmail,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "name" })
  @IsString()
  name: string;

  @ApiProperty({ example: "family" })
  @IsString()
  family: string;
  @ApiProperty({ example: "example@email.com" })
  @IsEmail()
  email: string;
  @ApiProperty({ example: "0049157446633" })
  @IsString()
  phone: string;
  @ApiProperty({ example: "male" })
  @IsString()
  sex: Sex;
  @ApiProperty({ example: "password123" })
  @IsString()
  password: string;
  @ApiProperty({ example: "Customer" })
  @IsOptional()
  @IsString()
  role: RoleEnum;
  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  is_verified: boolean;
}
