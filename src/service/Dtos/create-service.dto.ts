import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateServiceDto {
  @ApiProperty({ example: "provider-uuid-123", description: "شناسه ارائه‌دهنده سرویس" })
  @IsString()
  provider_id: string; // ForeignKey to User (Provider)

  @ApiProperty({ example: "Hairstyling", description: "عنوان سرویس" })
  @IsString()
  title: string;

  @ApiProperty({ example: 30, description: "مدت زمان سرویس به دقیقه" })
  @IsNumber()
  duration: number; // مدت زمان سرویس به دقیقه (مثلا 30 دقیقه)

  @ApiProperty({ example: true, description: "وضعیت فعال بودن سرویس" })
  @IsBoolean()
  is_active: boolean;

  @ApiPropertyOptional({ example: 100, description: "قیمت سرویس (اختیاری)" })
  @IsOptional()
  @IsNumber()
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
