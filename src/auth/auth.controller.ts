import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CreateUserDto } from "src/user/Dtos";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./Dtos/login.dto";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGaurd } from "./jwt-auth.guard";
import { LocalStrategy } from "./local.strategy";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UpdateAuthDto } from "./Dtos/UpdateAuthDto";
import { ApiResponseType } from "src/common/response.interface";
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post("/register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: "User created successfully" })
  async register(@Body() body: CreateUserDto) {
    const user = await this.authService.create(body);
    return user;
  }

  @Post("/login")
  @UseGuards(AuthGuard("local"))
  @ApiOperation({ summary: "Login and get JWT token" })
  //@ApiBody({ type: {} })
  @ApiResponse({ status: 200, description: "Successful login" })
  async login(@Request() req: any): Promise<ApiResponseType>  {
    const user = req.user;
    const token= this.jwtService.sign({ id: user.id, phone: user.phone,role:user.role,email:user.mail });
    if (!token) throw new NotFoundException("Fehler bei der Anmeldung");
    return { success: true, data: token, message: "Anmeldung erfolgreich" };
    
  }

  @UseGuards(JwtAuthGaurd)
  @Get("/profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user profile using JWT token" })
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  profile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGaurd)
  @ApiBearerAuth()
  @Put("update/:id")
  @ApiBody({ type: UpdateAuthDto })
  async updateUser(@Param("id") id: string, @Body() body: UpdateAuthDto) {
    return this.authService.updateUser(id, body);
  }

  @UseGuards(JwtAuthGaurd)
  @ApiBearerAuth()
  @Delete("delete/:id")
  async deleteUser(@Param("id") id: string) {
    return this.authService.deleteUser(id);
  }
}
