import { StatusEnum } from "@prisma/client";
import { IsString } from "class-validator";

export class CreateAppintmentDto {
  @IsString()
  status: StatusEnum;
  @IsString()
  notes: string;

  @IsString()
  customer_id: string; // # ForeignKey to User (Customer)

  @IsString()
  provider_id: string; //# ForeignKey to User (Provider)

  @IsString()
  service_id: string; // # ForeignKey to Service

  @IsString()
  time_slot_id: string; // # ForeignKey to TimeSlot
}
