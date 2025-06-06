import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TimeSlotService {
constructor(private readonly prisma:PrismaService){}
    // تابع خودکار برای ایجاد TimeSlotها
async  generateTimeSlots() {
    const schedules = await this.prisma.schedule.findMany({
      where: { is_available: true }
    });
  
    for (const schedule of schedules) {
      let currentTime = schedule.start_time;
      
      while (currentTime < schedule.end_time) {
        const endTime = new Date(currentTime.getTime() + 45 * 60000); // 45 دقیقه
        
        await this.prisma.timeSlot.create({
          data: {
            start_time: currentTime,
            end_time: endTime,
            schedule_id: schedule.id,
            status:"Available"
          }
        });
  
        currentTime = endTime;
      }
    }
  }
}
