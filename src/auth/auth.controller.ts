import {
  Body,
  Controller,
  Get,
  Post,
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
  async login(@Request() req: any) {
    const user = req.user;
    const token = this.jwtService.sign({ id: user.id, phone: user.phone });

    return {
      success: true,
      message: "Login successful",
      token,
      user,
    };
  }

  @UseGuards(JwtAuthGaurd)
  @Get("/profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user profile using JWT token" })
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  profile(@Request() req: any) {
    return req.user;
  }
}
