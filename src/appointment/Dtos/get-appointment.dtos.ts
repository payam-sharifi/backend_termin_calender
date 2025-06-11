import { IsOptional, IsString } from "class-validator";

export class GetAppintmentDto {
  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  start_Time: string;

  @IsOptional()
  @IsString()
  end_Time: string;
}
