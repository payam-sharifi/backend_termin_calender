import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateUserDto, FindUserDto, UpdateUserDto } from "./Dtos";
import { UUID } from "crypto";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async isUserExist(id: string) {
    const isExist = await this.prisma.user.findFirst({
      where: { id },
    });
    if (isExist) return false;
    true;
  }

  //create user/
  async create(dataRq: CreateUserDto) {
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
    const users = await this.prisma.user.findMany({
      relationLoadStrategy: "join",
      include: {
        service: true,
      },
    });
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
  async GetOneUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      relationLoadStrategy: "join",
      where: {
        id,
      },
      include: {
        service: {
          where: {
            provider_id: id, // Filter for the specific service ID
          },
          include:{
            timeSlots:true
          }
        },
        CustomerAppointments: {
          where: {
            customer_id: id, // Filter for the specific service ID
          },
        },
        ProviderAppointments: {
          where: {
            provider_id: id, // Filter for the specific service ID
          },
        },
       
      },
    });
    return user;
  }
  //delete user
  async deleteUserById(id: string) {
    const isUser = await this.isUserExist(id);
    if (isUser) return false;
    await this.prisma.user.delete({
      where: {
        id,
      },
    });
    return true;
  }
  //updateUserById
  async updateUserById(dataRq: UpdateUserDto, id: string) {
    const isUserExist = this.prisma.user.findFirst({ where: { id } });
    if (!isUserExist) return false;
    const user = await this.prisma.user.update({
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
