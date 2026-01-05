import { IsOptional, IsString, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
import { StatusEnum } from "@prisma/client";

export class GetAppintmentDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  start_Time?: string;

  @IsOptional()
  @IsString()
  end_Time?: string;

  @IsOptional()
  @IsString()
  provider_id?: string;

  @IsOptional()
  @IsString()
  customer_id?: string;

  @IsOptional()
  @IsString()
  status?: StatusEnum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
