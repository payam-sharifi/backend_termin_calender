import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateUserDto } from "src/user/Dtos";
import * as bcrypt from "bcrypt";
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  //create user/
  async create(dataRq: CreateUserDto) {
    const salt = await bcrypt.genSalt();

    const hashPassword = await bcrypt.hash(dataRq.password, 10);
    //must refactor
    const isUser = await this.prisma.user.findFirst({
      where: { email: dataRq.email, phone: dataRq.phone },
    });
    if (isUser) return "user already exist";
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
        email: true,
      },
    });
    return user;
  }



  async signIn(phone: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new UnauthorizedException("User not found");

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException("Incorrect password");

   
    const { password: _, ...result } = user;
    return result;
  }
}
