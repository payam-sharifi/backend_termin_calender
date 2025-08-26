import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "prisma/prisma.service";
import { SmsService } from "src/sms/sms.service";
import { convertToBerlinTime } from "utils/time.util";

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private prisma: PrismaService,
    private sendSMS: SmsService
  ) {}

  @Cron("*/15 * * * *") // هر ۱۵ دقیقه
  async handleReminderCheck() {
    const now = new Date();
    const fiveHoursLater = new Date(now.getTime() + 5 * 60 * 60 * 1000);

    // پیدا کردن همه اسلات‌هایی که توی بازه هستن
    const upcomingSlots = await this.prisma.timeSlot.findMany({
      where: {
        start_time: {
          gte: fiveHoursLater,
          lt: new Date(fiveHoursLater.getTime() + 15 * 60 * 1000), // lt به جای lte
        },
        reminderSent: false,
      },
      include: {
        user: true,
      },
    });

    for (const slot of upcomingSlots) {
      if (!slot.user?.phone) continue;

      try {
        // اتمیک آپدیت → فقط اگر هنوز reminderSent=false باشه، ست میشه
        const updated = await this.prisma.timeSlot.updateMany({
          where: { id: slot.id, reminderSent: false },
          data: { reminderSent: true },
        });

        if (updated.count === 0) {
          // یعنی یکی دیگه همزمان آپدیت کرده → SMS نزن
          continue;
        }

        const starttime = convertToBerlinTime(slot.start_time);

        await this.sendSMS.sendTwilioSms(
          slot.user.phone,
          `Erinnerung: Ihre Zeit heute ${starttime} ist.`
        );

        this.logger.log(`SMS sent to ${slot.user.phone}`);
      } catch (error) {
        this.logger.error(
          `Failed to send SMS to ${slot.user?.phone ?? "unknown"}: ${error}`
        );
      }
    }
  }
}
