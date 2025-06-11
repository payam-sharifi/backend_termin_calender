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
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, UpdateUserDto } from "./Dtos";

@Controller("/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  //GetUserById
  @Get("/:id")
  async getUser(@Param("id") id: string) {
    try {
      const user = await this.userService.GetOneUserById(id);
      if (!user) {
        throw new NotFoundException("User Not Found");
      }
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  //GetAllUsers
  @Get()
  async getAllUser() {
    const user = await this.userService.GetAllUsers();
    if (!user) {
      throw new NotFoundException("User Not Found");
    }
    return user;
  }

  @Post()
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.userService.create(body);
    return user;
  }

  @Put("/:id")
  async updateUser(
    @Body() body: UpdateUserDto,
    @Param("id", ParseIntPipe) id: string
  ) {
    const updatedUser = await this.userService.updateUserById(body, id);
    if (!updatedUser) {
      throw new NotFoundException("User Not Found");
    }
    return updatedUser;
  }

  @Delete("/:id")
  async deleteUser(@Param("id") id: string) {
    const deletedUser = await this.userService.deleteUserById(id);
    if (!deletedUser) {
      throw new NotFoundException("User Not Found Or ");
    }
    return "user Deleted";
  }
}
