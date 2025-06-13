import {  IsOptional, IsString } from "class-validator";

export class GetServiceDto {
   
@IsString()
provider_id:string

@IsString()
start_time:string

@IsOptional()
@IsString()
color:string

@IsString()
end_time:string
}
