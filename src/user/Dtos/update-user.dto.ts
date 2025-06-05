import { RoleEnum, Sex } from "@prisma/client";
import { IsString, IsBoolean } from "class-validator";

export class UpdateUserDto {
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
  @IsString()
  role: RoleEnum;
  @IsBoolean()
  is_verified: boolean;
}
