import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./Dtos/create-user.dto";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dataRq: CreateUserDto) {
            const user =this.prisma.user.create({
              data:{
                  name:dataRq.name,
                  family:dataRq.family,
                  phone:dataRq.phone,
                  password:dataRq.password,
                  sex:dataRq.sex,
                  role:dataRq.role,
                  is_verified:dataRq.is_verified,
                  email:dataRq.email

                
              }
            })    
    return 'user';
  }
}
