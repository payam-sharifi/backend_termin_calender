import { RoleEnum, Sex } from "@prisma/client";
import { IsString, IsBoolean } from "class-validator";

export class FindUserDto {
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
  role: RoleEnum;
  @IsBoolean()
  is_verified: boolean;
}
