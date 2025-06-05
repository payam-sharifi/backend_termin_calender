import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, UpdateUserDto } from "./Dtos";


@Controller("/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  async getUser(@Param("id",ParseIntPipe)  id:number) {
    const user=await this.userService.GetOneUserById(id)
     if(!user){ 
       throw new NotFoundException("User Not Found")
    }
    return user;
  }

  @Post()
   async createUser(@Body() body: CreateUserDto) {
    const user = await this.userService.create(body);
    return user;
  }

  @Put("/:id")
  async updateUser(@Body() body: UpdateUserDto,@Param("id",ParseIntPipe)  id:number ) {
    const user= await this.userService.updateUserById(body,id)
  }

  @Delete("/:id")
  deleteUser(): string {
    return "user updated";
  }
}
