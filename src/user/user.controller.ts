// user.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, UpdateUserDto } from "./Dtos";
import { RoleEnum } from "@prisma/client";
import { ApiResponseType } from "../common/response.interface"
import { ApiTags, ApiQuery, ApiResponse as SwaggerResponse } from "@nestjs/swagger";

@ApiTags("Users")
@Controller("/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/:id")
  async getUser(@Param("id") id: string): Promise<ApiResponseType> {
    const user = await this.userService.GetOneUserById(id);
    if (!user) throw new NotFoundException("User Not Found");
    return { success: true, data: user , message: "",};
  }

  @Get()
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "role", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getAllUser(
    @Query("search") search?: string,
    @Query("role") role?: string,
    @Query("page") page = 1,
    @Query("limit") limit = 10
  ): Promise<ApiResponseType> {
    let validRole: RoleEnum | undefined;

    if (role && Object.values(RoleEnum).includes(role as RoleEnum)) {
      validRole = role as RoleEnum;
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(limit) || 10, 1);
    const skip = (pageNumber - 1) * pageSize;

    const result = await this.userService.GetAllUsers(validRole, search, skip, pageSize);

    return {
      success: true,
      data: result.data,
      message: `Fetched ${result.data.length} user(s).`,
    };
  }

  @Post()
  async createUser(@Body() body: CreateUserDto): Promise<ApiResponseType> {
    const user = await this.userService.create(body);
    return { success: true, data: user, message: "Benutzer erfolgreich erstellt." };
  }

  @Put("/:id")
  async updateUser(
    @Body() body: UpdateUserDto,
    @Param("id") id: string
  ): Promise<ApiResponseType> {
    const updatedUser = await this.userService.updateUserById(body, id);
    if (!updatedUser) throw new NotFoundException("Benutzer nicht gefunden");
    return { success: true, data: updatedUser, message: "Benutzer erfolgreich aktualisiert." };
  }

  @Delete("/:id")
  async deleteUser(@Param("id") id: string): Promise<ApiResponseType> {
    console.log(id)
    const deletedUser = await this.userService.deleteUserById(id);
    if (!deletedUser) throw new NotFoundException("Benutzer nicht gefunden");
    return { success: true, message: "Benutzer erfolgreich gelöscht." };
  }
}
