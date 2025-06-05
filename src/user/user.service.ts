import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateUserDto, DeleteUserDto, FindUserDto, UpdateUserDto } from "./Dtos";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async isUserExist(email: string, phone: string) {
    const isExist = await this.prisma.user.findFirst({
      where: { OR: [{ email: email }, { phone: phone }] },
    });
    if (isExist) return false;
    true;
  }

  //create user
  async create(dataRq: CreateUserDto) {
    const isuser = await this.isUserExist(dataRq.email, dataRq.phone);
    if (isuser) return "user already exist";
    const user = await this.prisma.user.create({
      data: {
        name: dataRq.name,
        family: dataRq.family,
        phone: dataRq.phone,
        password: dataRq.password,
        sex: dataRq.sex,
        role: dataRq.role,
        is_verified: dataRq.is_verified,
        email: dataRq.email,
      },
    });
    return user;
  }

  //getAllUsers
  async GetAllUsers() {
    const users = await this.prisma.user.findMany();
    return users;
  }

  //getOneUserby...
  async GetOneUsers(dataRq: FindUserDto) {
    const user = await this.prisma.user.findMany({
      where: {
        OR: [
          { email: dataRq.email },
          { phone: dataRq.phone },
          { family: dataRq.family },
          { role: dataRq.role },
          { is_verified: dataRq.is_verified },
          { name: dataRq.name },
          { sex: dataRq.sex },
        ],
      },
    });
    return user;
  }
  //getOneUserId...
  async GetOneUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  //delete user
  async delete(dataRq: DeleteUserDto) {
    const isUser = await this.isUserExist(dataRq.email, dataRq.phone);
    if (!isUser) return "user not found";

    const isDelete = await this.prisma.user.delete({
      where: {
        email: dataRq.email,
      },
    });
  }


  //updateUserById
  async updateUserById(dataRq:UpdateUserDto ,id:number){
    const user = await this.prisma.user.updateMany({
      where: {
        id,
      },
      data: {
        name: dataRq.name,
        family: dataRq.family,
        phone: dataRq.phone,
        password: dataRq.password,
        sex: dataRq.sex,
        role: dataRq.role,
        is_verified: dataRq.is_verified,
        email: dataRq.email,
      },
    });
    return user;
  }
}
