import {  IsString } from "class-validator";

export class DeleteServiceDto {
   

  @IsString()
  title: string; 

}
