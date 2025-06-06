import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateServiceDto {
   
  @IsString()
  provider_id:string // ForeignKey to User (Provider)
  @IsString()
  title: string; 

  @IsNumber()
  duration: number; // مدت زمان سرویس به دقیقه (مثلا 30 دقیقه)
  

  @IsBoolean()
  is_active: boolean;
  
  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  description: string;
  
 
}
