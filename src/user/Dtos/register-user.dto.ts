import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RoleEnum, Sex } from "@prisma/client";
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEmail,
  Length,
  IsUUID,
} from "class-validator";

/**
 * Public self-registration (`POST /auth/register`): `provider_id` is optional.
 * For provider-scoped user creation, use `CreateUserDto` on `POST /user` instead.
 */
export class RegisterUserDto {
  @ApiProperty({ example: "name" })
  @IsString({ message: "Der Name muss ein Text sein." })
  name: string;

  @ApiPropertyOptional({
    example: "6d67fe81-2e4b-44ef-8866-bf820a6d4287",
    description: "Optional at registration; omit for standalone sign-up.",
  })
  @IsOptional()
  @IsUUID(4, { message: "Der Provider ID muss ein gültige UUID sein." })
  provider_id?: string;

  @ApiProperty({ example: "family", required: false })
  @IsOptional()
  @IsString({ message: "Der Nachname muss ein Text sein." })
  family?: string;

  @ApiProperty({ example: "example@email.com" })
  @IsOptional()
  @IsEmail({}, { message: "Die E-Mail-Adresse muss gültig sein." })
  email?: string | null;

  @ApiProperty({ example: "+491234567890" })
  phone: string;

  @ApiProperty({ example: "1234", required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: "male" })
  @IsOptional()
  @IsString({ message: "Das Geschlecht muss ein TEXT sein." })
  sex: Sex;

  @ApiProperty({ example: "password123" })
  @IsOptional()
  @IsString()
  @Length(5, 12, {
    message: "Das Passwort muss zwischen 5 und 12 Zeichen lang sein.",
  })
  password: string;

  @ApiProperty({ example: "Customer" })
  @IsOptional()
  @IsString({ message: "Die Rolle muss ein Text sein." })
  role: RoleEnum;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean({ message: "Der Wert muss ein Wahrheitswert (true oder false) sein." })
  is_verified: boolean;
}
