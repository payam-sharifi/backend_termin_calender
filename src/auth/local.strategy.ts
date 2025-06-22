import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // تغییر usernameField به phone
    super({ usernameField: 'phone', passReqToCallback: true });
  }

  async validate(req: Request, phone: string, password: string): Promise<any> {
    // کد ارسالی از کلاینت (در body)
    console.log("locoal strategy run")
    const code = (req.body as any)?.code;
    console.log("code",code)
    const user = await this.authService.signIn(phone, password, code);
    if (!user) {
      throw new UnauthorizedException('Benutzer nicht autorisiert');
    }

    return user;
  }
}
