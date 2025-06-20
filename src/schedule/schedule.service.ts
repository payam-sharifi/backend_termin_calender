import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateScheduleDto } from "./Dtos/create.schedule.dtos";

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}
  // Remove duplicates
  async uniqueData(bodies: CreateScheduleDto[]) {
    return bodies.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.start_time === item.start_time &&
            t.day_of_week === item.day_of_week &&
            t.provider_id === item.provider_id
        )
    );
  }

  // async ExistingSchedule(bodies: CreateScheduleDto[]) {
  //  // const uniqueData = await this.uniqueData(bodies);
  //   // Fetch existing schedules based on the provided criteria
  //   //تکراری ها را برمیگرداند
  //   const existingSchedules = await this.prisma.schedule.findMany({
  //     where: {
  //       OR: bodies.map((body) => ({
  //         day_of_week: body.day_of_week,
  //         start_time: body.start_time,
  //         provider_id: body.provider_id,
  //       })),
  //     },
  //   });
  //   console.log(existingSchedules, "reapted fileds in db");

  //   return existingSchedules; // Return only the unique schedules that do not exist
  // }

  // تابع خودکار برای ایجاد TimeSlotها

  //Auto Genereate TileSlots
  async generateTimeSlots(bodies: CreateScheduleDto[]) {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        OR: bodies.map((body) => ({
          provider_id: body.provider_id,
        })),
      },
    });
    // const duration= await this.prisma.service.findFirst({
    //   where: {
    //     OR: bodies.map((body) => ({
    //       provider_id: body.provider_id
    //     })),
    //   },
    // });
    // const schedules = await this.prisma.schedule.findMany({
    //   where: { is_available: true,provider_id:bo }
    // });

    for (const schedule of schedules) {
      let currentTime = schedule.start_time;

      while (currentTime < schedule.end_time) {
        const endTime = new Date(currentTime.getTime() + 90 * 60000); // 90 دقیقه

        // await this.prisma.timeSlot.create({
        //   data: {
        //     start_time: currentTime,
        //     end_time: endTime,
        //     service_id: schedule.id,
        //     status: "Available",
        //   },
        // });

        currentTime = endTime;
      }
    }
  }

  ///create methods
  async createManySchedules(body: CreateScheduleDto[]) {
    const data = await this.uniqueData(body);
    const createSchedules = await this.prisma.schedule.createMany({
      data: data,
      skipDuplicates: true,
    });
    this.generateTimeSlots(body);
    return createSchedules;
  }
  // async getAvailableTimeSlot(start_time: string, end_time: string, status?:any) {
  //   return this.prisma.timeSlot.findMany({
  //     relationLoadStrategy: 'join',
  //     where: {
  //       status,
  //       start_time: new Date(start_time),
  //       end_time:new Date(end_time)
  //     },
  //     include: {
  //       schedule: true,
  //       Appointment:true
  //     },
  //   });
  // }

  async getAllSchedulesByDate(
    start_time: string,
    end_time: string,
    is_available?: any
  ) {
    const time = await this.prisma.schedule.findMany({
      relationLoadStrategy: "join",
      where: {
        start_time: {
          gte: new Date(start_time),
        },
        end_time: {
          lte: new Date(end_time),
        },
        is_available: is_available == "true" ? true : false,
      },
      // include: {
      //   timeSlot: true,
      // },
     
    });
    return time;
  }
}
