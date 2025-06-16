import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

import { AuthService } from "./auth.service";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(public authService: AuthService) {
    super({
      secretOrKey: "hengameh-termin-koln",
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }
  validate(payload: any) {
    return { email: payload.email, id: payload.id };
  }
}
