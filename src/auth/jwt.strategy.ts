import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    public authService: AuthService,
    public configService: ConfigService
  ) {
    const jwtSecret = configService.get<string>("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }
    super({
      secretOrKey: jwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }
  async validate(payload: any): Promise<any> {
    // optionally: user را از دیتابیس بخون
    // const user = await this.authService.findUserById(payload.id);
    return {
      id: payload.id,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      name: payload.name,
    };
  }
}
