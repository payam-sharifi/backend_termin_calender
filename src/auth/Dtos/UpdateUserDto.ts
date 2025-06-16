import { IsEmail, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Sex, RoleEnum } from "@prisma/client";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  family?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  @ApiPropertyOptional()
  phone?: string;

  @IsOptional()
  @ApiPropertyOptional({ enum: Sex })
  sex?: Sex;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  role?: RoleEnum;
}
