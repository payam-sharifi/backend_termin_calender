import { IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetServiceDto {
  @ApiProperty({ example: "provider-uuid-123", description: "شناسه ارائه‌دهنده سرویس" })
  @IsString()
  provider_id: string;

  @ApiProperty({ example: "2025-06-15", description: "زمان شروع فیلتر به صورت ISO 8601" })
  @IsString()
  start_time: string;

  @ApiPropertyOptional({ example: "#C9D1AC", description: "رنگ سرویس (اختیاری)" })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: "2025-06-15", description: "زمان پایان فیلتر به صورت ISO 8601" })
  @IsString()
  end_time: string;
}
