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
import { OtpService } from "src/otp/otp.service";
import { PrismaService } from "prisma/prisma.service";
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly prisma: PrismaService
  ) {}

  @Post("/register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: "User created successfully" })
  async register(@Body() body: CreateUserDto) {
    const valid = await this.otpService.verifyOtp(body.phone, body.code);
    if (valid) {
      const user = await this.prisma.user.findUnique({
        where: { phone: body.phone },
      });
      if (!user) {
        const user = await this.authService.create(body);
        return {success: true, data:user, message: "Anmeldung erfolgreich" };
      }
      return { success: false, data: null, message: "Benutzer existiert bereits"};
    }
    return { success: false, data: null, message: "Der eingegebene Code ist falsch" };
   
  }
 
  @Post("send-otp")

  async sendOtp(@Body("phone") phone: string) {
    return this.otpService.sendOtp(phone);
  }

  @Post("/login")
  @UseGuards(AuthGuard("local"))
  @ApiOperation({ summary: "Login and get JWT token" })
  //@ApiBody({ type: {} })
  @ApiResponse({ status: 200, description: "Successful login" })
  async login(@Request() req: any): Promise<ApiResponseType> {
   
    const user = req.user;
    const token = this.jwtService.sign({
      id: user.id,
      phone: user.phone,
      role: user.role,
      email: user.mail,
    });
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
