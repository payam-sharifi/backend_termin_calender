import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateScheduleDto } from "./Dtos/create.schedule.dtos";

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async ExistingSchedule(bodies: CreateScheduleDto[]) {
    // Fetch existing schedules based on the provided criteria
    const existingSchedules = await this.prisma.schedule.findMany({
      where: {
        OR: bodies.map((body) => ({
          day_of_week: body.day_of_week,
          start_time: body.start_time,
          provider_id: body.provider_id,
        })),
      },
    });

    // Create a Set to track unique identifiers of existing schedules
    const existingIdentifiers = new Set<string>();

    existingSchedules.forEach((schedule) => {
      const identifier = `${schedule.day_of_week}-${schedule.start_time}-${schedule.provider_id}`;
      existingIdentifiers.add(identifier);
    });

    // Filter out bodies that already exist in the database
    const uniqueBodies = bodies.filter((body) => {
      const identifier = `${body.day_of_week}-${body.start_time}-${body.provider_id}`;
      return !existingIdentifiers.has(identifier);
    });
    return uniqueBodies; // Return only the unique schedules that do not exist
  }

  async createManySchedules(body: CreateScheduleDto[]) {
      const data = await this.ExistingSchedule(body);
      const createSchedules = await this.prisma.schedule.createMany({
        data: data,
        skipDuplicates: true,
      });
      return createSchedules;
   
  }


  
}
