// otp.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

class SendOtpDto {
  phone: string;
}

class VerifyOtpDto {
  phone: string;
  code: string;
}

@ApiTags('OTP')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  
  @Post('send')
  @ApiOperation({ summary: 'Sende einen Bestätigungscode an die Telefonnummer' })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({ status: 201, description: 'Der Code wurde gesendet.' })
  async sendOtp(@Body('phone') phone: string) {
    await this.otpService.sendOtp(phone);
    return { message: 'Der Bestätigungscode wurde erfolgreich gesendet.' };
  }
  @Post('create')
  @ApiBody({ type: VerifyOtpDto })
  async saveOtp(@Body() {phone,code}:VerifyOtpDto){
  
    return this.otpService.saveOtp(phone,code)
  }

  @Post('verify')
  @ApiOperation({ summary: 'Überprüfe den Bestätigungscode' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'Code gültig.' })
  @ApiResponse({ status: 400, description: 'Code ungültig oder abgelaufen.' })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    try {
      await this.otpService.verifyOtp(body.phone, body.code);
      return { success: true, message: 'Der Code ist gültig.' };
    } catch (e) {
      return { success: false, message: 'Der Code ist ungültig oder abgelaufen.' };
    }
  }
  
}
