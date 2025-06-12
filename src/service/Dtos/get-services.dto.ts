import {  IsString } from "class-validator";

export class GetServiceDto {
   
@IsString()
provider_id:string

@IsString()
start_time:string
 
@IsString()
end_time:string
}
