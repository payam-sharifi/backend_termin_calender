import { StatusEnum } from "@prisma/client";
import { IsString } from "class-validator";

export class CreateAppintmentDto {
  @IsString()
  status: StatusEnum;
  @IsString()
  notes: string;
}
