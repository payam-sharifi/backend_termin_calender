import { RoleEnum, Sex } from "@prisma/client";
import { IsString, IsBoolean } from "class-validator";

export class FindUserDto {
  @IsString({ message: 'Der Name muss ein Text sein.' })
  name: string;

  @IsString({ message: 'Der Nachname muss ein Text sein.' })
  family: string;

  @IsString({ message: 'Die E-Mail-Adresse muss ein Text sein.' })
  email: string;

  @IsString({ message: 'Die Telefonnummer muss ein Text sein.' })
  phone: string;

  @IsString({ message: 'Das Geschlecht muss ein Text sein.' })
  sex: Sex;

  @IsString({ message: 'Die Rolle muss ein Text sein.' })
  role: RoleEnum;

  @IsBoolean({ message: 'Der Wert muss ein Wahrheitswert (true oder false) sein.' })
  is_verified: boolean;
}
