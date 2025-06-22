import { Body, Controller, Post } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
    constructor(private readonly smsService: SmsService) {}

    @Post()
    async sendSms(@Body() body: { to: string; message: string }) {
      return await this.smsService.sendTwilioSms(body.to, body.message);
    }
}
