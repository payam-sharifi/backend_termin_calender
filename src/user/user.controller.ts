import { Body, Controller, Delete, Get, Post, Put } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./Dtos/create-user.dto";

@Controller("/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(): string {
    return "Hello World!";
  }

  @Post()
   async createUser(@Body() body: CreateUserDto) {
    const user = await this.userService.create(body);
    return user;
  }

  @Put("/:id")
  updateUser(): string {
    return "user updated";
  }

  @Delete("/:id")
  deleteUser(): string {
    return "user updated";
  }
}
