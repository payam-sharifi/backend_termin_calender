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
    // Get the most recent OTP for this phone (optimized query)
    const record = await this.prisma.otp.findFirst({
      where: {
        phone,
        expiresAt: {
          gt: new Date(), // Only get non-expired OTPs
        },
      },
      orderBy: {
        createdAt: 'desc', // Get the most recent one
      },
    });
    
    if (!record) {
      throw new BadRequestException("Code ist ungültig oder abgelaufen.");
    }
  
    // Verify code match
    const isMatch = record.code === inputCode;
    if (!isMatch) {
      throw new BadRequestException("Code ist ungültig.");
    }
  
    // Delete used OTP to prevent reuse
    await this.prisma.otp.delete({
      where: { id: record.id },
    }).catch(() => {}); // Ignore errors if already deleted
  
    return true;
  }
  
  async saveOtp(phone: string, code: string){
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 
    return await this.prisma.otp.create({
      data: { phone, code, expiresAt},
    });
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
