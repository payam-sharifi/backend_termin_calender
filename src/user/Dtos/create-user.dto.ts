import { RoleEnum, Sex } from "@prisma/client";
import { IsString, IsBoolean, IsEmpty, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsString()
  name: string;
  @IsString()
  family: string;
  @IsString()
  email: string;
  @IsString()
  phone: string;
  @IsString()
  sex: Sex;
  @IsString()
  password: string;
  @IsOptional()
  @IsString()
  role: RoleEnum;
  @IsOptional()
  @IsBoolean()
  is_verified: boolean;
}
