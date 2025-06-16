import { IsOptional, IsString, IsISO8601 } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetServiceDto {
  @ApiProperty({ example: "provider-uuid-123", description: "شناسه ارائه‌دهنده سرویس" })
  @IsString()
  provider_id: string;

  @ApiProperty({ example: "2025-06-15T00:00:00Z", description: "زمان شروع فیلتر به صورت ISO 8601" })
  @IsISO8601({}, { message: 'Das Startdatum muss im ISO 8601-Format sein.' })
  start_time: string;

  @ApiPropertyOptional({ example: "#C9D1AC", description: "رنگ سرویس (اختیاری)" })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: "2025-06-15T23:59:59Z", description: "زمان پایان فیلتر به صورت ISO 8601" })
  @IsISO8601({}, { message: 'Das Enddatum muss im ISO 8601-Format sein.' })
  end_time: string;
}
