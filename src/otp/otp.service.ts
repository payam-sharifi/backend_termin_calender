import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
//import { sendSMS } from "../reminder/sms.helper";
import { Cron } from "@nestjs/schedule";
import { SmsService } from "src/sms/sms.service";
import * as crypto from 'crypto';
@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService,private sendSMS:SmsService) {}

  async sendOtp(phone: string) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // ۵ دقیقه اعتبار

    await this.prisma.otp.create({
      data: { phone, code, expiresAt },
    });

    await this.sendSMS.sendTwilioSms(
       phone,
       `Ihr Login-Code: ${code}`,
    );

    return { message:"Code gesendet"};
  }

  async verifyOtp(phone: string, inputCode: string) {
    console.log("verifyOtp run")
    const record = await this.prisma.otp.findFirst({
      where: {
        phone,
        
      },
    
    });
      console.log(record,"record")
    if (!record) {
      throw new BadRequestException("Code ist ungültig oder abgelaufen.");
    }
  
    const isMatch =
      record.code.length === inputCode.length &&
      crypto.timingSafeEqual(Buffer.from(record.code), Buffer.from(inputCode));
        console.log(isMatch,"isMatch")
    if (!isMatch) {
      throw new BadRequestException("Code ist ungültig.");
    }
  
    return true;
  }
  

  @Cron("*/2 * * * *") // هر ساعت در دقیقه 0 اجرا می‌شود
  async cleanExpiredOtps() {
    const result = await this.prisma.otp.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    console.log(`[Cron] Removed ${result.count} expired OTPs`);
  }
}
