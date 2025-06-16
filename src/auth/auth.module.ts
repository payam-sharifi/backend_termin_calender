import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'prisma/prisma.module';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtModule],
  imports:[PrismaModule,PassportModule,JwtModule.register({
    secret:"hengameh-termin-koln",
   //signOptions:{expiresIn:"30d"}
  })]
})
export class AuthModule {}
