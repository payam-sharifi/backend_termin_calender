import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'prisma/prisma.service';
import { sendSMS } from './sms.helper';


@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('*/15 * * * *') // هر ۱۵ دقیقه
  async handleReminderCheck() {
    const now = new Date();
    const fiveHoursLater = new Date(now.getTime() + 5 * 60 * 60 * 1000);

    const upcomingSlots = await this.prisma.timeSlot.findMany({
        where: {
          start_time: {
            gte: fiveHoursLater,
            lte: new Date(fiveHoursLater.getTime() + 15 * 60 * 1000),
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
        await sendSMS({
          to: slot.user.phone,
          text: `یادآوری: تایم شما امروز ساعت ${slot.start_time.toLocaleTimeString('de-DE')} است.`,
        });
        this.logger.log(`SMS sent to ${slot.user.phone}`);
        await this.prisma.timeSlot.update({
            where: { id: slot.id },
            data: { reminderSent: true },
          });
      } catch (error) {
        this.logger.error(`Failed to send SMS to ${slot.user.phone}: ${error}`);
      }
    }
  }
}
