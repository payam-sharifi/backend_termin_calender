import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateServiceDto {
  @ApiProperty({ example: "provider-uuid-123", description: "شناسه ارائه‌دهنده سرویس" })
  @IsString()
  provider_id: string;

  @ApiProperty({ example: "Hairstyling", description: "عنوان سرویس" })
  @IsString()
  title: string;

  @ApiProperty({ example: 30, description: "مدت زمان سرویس به دقیقه" })
  @IsNumber()
  @Min(1, { message: "Die Dauer muss mindestens 1 Minute sein." })
  duration: number;

  @ApiProperty({ example: true, description: "وضعیت فعال بودن سرویس" })
  @IsBoolean()
  is_active: boolean;

  @ApiPropertyOptional({ example: 100, description: "قیمت سرویس (اختیاری)" })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Der Preis darf nicht negativ sein." })
  price?: number;

  @ApiPropertyOptional({ example: "#C9D1AC", description: "رنگ مرتبط با سرویس (اختیاری)" })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: "Hair styling for special events", description: "توضیحات سرویس (اختیاری)" })
  @IsOptional()
  @IsString()
  description?: string;
}
