import {

  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateUserDto } from "src/user/Dtos";
import * as bcrypt from "bcrypt";
import { UpdateAuthDto } from "./Dtos/UpdateAuthDto";
import { OtpService } from "src/otp/otp.service";
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService
  ) {}
  //create user/
  async create(dataRq: CreateUserDto) {
    const salt = await bcrypt.genSalt();

    const hashPassword = await bcrypt.hash(dataRq.password, 10);
    //must refactor
    // const isUser = await this.prisma.user.findFirst({
    //   where: { email: dataRq.email, phone: dataRq.phone },
    // });
    // if (isUser) return "user already exist";
    const user = await this.prisma.user.create({
      data: {
        name: dataRq.name,
        family: dataRq.family,
        phone: dataRq.phone,
        password: hashPassword,
        sex: dataRq.sex,
        role: dataRq.role,
        is_verified: dataRq.is_verified,
        email: dataRq.email,
      },
      select: {
        name: true,
        phone: true,
        email: true,
      },
    });
    return user;
  }

  async signIn(phone: string, password?: string, code?: string): Promise<any> {
    //if user exist
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new UnauthorizedException("Benutzer nicht gefunden");

    //with code
    if (code && !password) {
      const valid = await this.otpService.verifyOtp(phone, code);
      if (valid) {
        //if code is correct
        return user;
      } else {
        //if code is incorrect
        throw new UnauthorizedException("Code ist falsch");
      }
    } 
    
      //with password
      if (!code && password) {
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid)
          throw new UnauthorizedException("Falsches Passwort");
        const { password: _, ...result } = user;
        return result;
      }
    
     
  }

  // 🔁 بروزرسانی کاربر
  async updateUser(id: string, body: UpdateAuthDto) {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: body,
        select: {
          id: true,
          name: true,
          family: true,
          email: true,
          phone: true,
          sex: true,
          role: true,
        },
      });
      return {
        success: true,
        message: "Benutzer erfolgreich aktualisiert",
        data: updated,
      };
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException("Benutzer nicht gefunden");
      }
      throw error;
    }
  }

  // حذف کاربر
  async deleteUser(id: string) {
    try {
      const deleted = await this.prisma.user.delete({
        where: { id },
      });
      return {
        success: true,
        message: "Benutzer erfolgreich gelöscht",
        data: deleted,
      };
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException("Benutzer nicht gefunden oder bereits gelöscht");
      }
      throw error;
    }
  }
}
