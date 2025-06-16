import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: "provider-uuid-123", description: "شناسه ارائه‌دهنده سرویس" })
  @IsOptional()
  @IsString()
  provider_id: string; // ForeignKey to User (Provider)

  @ApiPropertyOptional({ example: "خدمات نظافت", description: "عنوان سرویس" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 30, description: "مدت زمان سرویس به دقیقه" })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ example: 250, description: "قیمت سرویس (اختیاری)" })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: "توضیحات اضافی درباره سرویس", description: "توضیحات سرویس (اختیاری)" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "#C9D1AC", description: "رنگ سرویس" })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: true, description: "وضعیت فعال بودن سرویس" })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
