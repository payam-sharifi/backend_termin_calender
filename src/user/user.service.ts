import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateUserDto, FindUserDto, UpdateUserDto } from "./Dtos";
import { Prisma, RoleEnum } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  //  Fix logic: Return true if user exists
  async isUserExist(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return !!user;
  }

  // Create user with conflict check
  async create(dto: CreateUserDto) {
    const orConditions: Prisma.UserWhereInput[] = [];

    if (dto.email != null) {
      orConditions.push({ email: dto.email });
    }

    if (dto.phone) {
      orConditions.push({ phone: dto.phone });
    }

    if (orConditions.length === 0) {
      throw new BadRequestException("Either email or phone must be provided.");
    }
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        "User already exists with given email or phone."
      );
    }
    const { email, ...rest } = dto;

    const userData = {
   ...dto,
      ...(dto.email && { email: dto.email }),
    };
console.log(userData,"userData")
    const user = await this.prisma.user.create({ data:userData });
    
    return user;
  }

  // ✅ Get all users with pagination
  async GetAllUsers(role?: RoleEnum, search?: string, skip = 0, take = 10) {
    const whereClause: any = {};

    if (role) {
      whereClause.role = role;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        relationLoadStrategy: "join",
        where: whereClause,
        include: {
          service: true,
        },
        skip,
        take,
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      data: users,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }

  //  Get one or multiple users by optional filters
  async GetOneUsers(filters: FindUserDto) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: filters.email },
          { phone: filters.phone },
          { family: filters.family },
          { name: filters.name },
          { role: filters.role },
          { is_verified: filters.is_verified },
          { sex: filters.sex },
        ],
      },
    });
  }

  // Get user by ID with full related data
  async GetOneUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      // relationLoadStrategy: "join",
      where: { id },
      // include: {
      //   service: {
      //     where: { provider_id: id },
      //     include: {
      //       timeSlots:{include:{user:true}},
      //     },
      //   },
      // },
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return user;
  }

  // Delete user with existence check
  async deleteUserById(id: string): Promise<boolean> {
    const exists = await this.isUserExist(id);
    if (!exists) {
      throw new NotFoundException("User not found.");
    }

    await this.prisma.user.delete({ where: { id } });
    return true;
  }

  // ✅ Update user safely
  async updateUserById(dto: UpdateUserDto, id: string) {
    const exists = await this.isUserExist(id);
    if (!exists) {
      throw new NotFoundException("User not found.");
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return updated;
  }
}
