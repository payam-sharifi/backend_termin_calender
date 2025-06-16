import { IsBoolean, IsNumber, IsOptional, IsString, Min, Matches } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: "provider-uuid-123", description: "شناسه ارائه‌دهنده سرویس" })
  @IsOptional()
  @IsString()
  provider_id?: string;

  @ApiPropertyOptional({ example: "خدمات ...", description: "عنوان سرویس" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 30, description: "مدت زمان سرویس به دقیقه" })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Die Dauer muss mindestens 1 Minute sein.' })
  duration?: number;

  @ApiPropertyOptional({ example: 250, description: "قیمت سرویس (اختیاری)" })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Der Preis darf nicht negativ sein.' })
  price?: number;

  @ApiPropertyOptional({ example: "توضیحات اضافی درباره سرویس", description: "توضیحات سرویس (اختیاری)" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "#C9D1AC", description: "رنگ سرویس" })
  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{3}){1,2}$/, { message: 'Die Farbe muss ein gültiger Hex-Farbcode sein.' })
  color?: string;

  @ApiPropertyOptional({ example: true, description: "وضعیت فعال بودن سرویس" })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
