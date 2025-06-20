import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { sendSMS } from "../reminder/sms.helper";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  async sendOtp(phone: string) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // ۵ دقیقه اعتبار

    await this.prisma.otp.create({
      data: { phone, code, expiresAt },
    });

    await sendSMS({
      to: phone,
      text: `Ihr Login-Code: ${code}`,
    });

    return { message:"Code gesendet"};
  }

  async verifyOtp(phone: string, code: string) {
    const record = await this.prisma.otp.findFirst({
      where: {
        phone,
        code,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) {
      throw new Error("Der Code ist ungültig oder abgelaufen.");
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
