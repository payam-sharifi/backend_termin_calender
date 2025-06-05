
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateServiceDto {
   
  @IsNumber()
  provider_id:string // ForeignKey to User (Provider)
  @IsString()
  title: string; 

  @IsNumber()
  duration: number; // مدت زمان سرویس به دقیقه (مثلا 30 دقیقه)
  
  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  description: string;
  
  @IsBoolean()
  is_active: boolean;
}
