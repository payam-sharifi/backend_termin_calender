import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, TimeSlotEnum } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { CreateTimeSlotDto } from "./Dtos/createTimeSlots.dto";
import { GetTimeslotDto } from "./Dtos/getTimeslot.dtos";
import { SmsService } from "../sms/sms.service";
import { UpdateTimeSlotDto } from "./Dtos/updateTimeSlots.dto";
import { convertToBerlinTime } from "utils/time.util";
import { GetUserTimeSlotsDto } from "./Dtos/getUserTimeSlots.dto";

@Injectable()
export class TimeSlotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService
  ) {}
  async getAvailableTimeSlot(body: GetTimeslotDto) {
    return this.prisma.timeSlot.findMany({
      relationLoadStrategy: "join",
      where: {
        //  user_Id:body.user_Id,
        service_id: body.service_id,
        start_time: new Date(body.start_time),
        end_time: new Date(body.end_time),
      },
      // include: {
      //   //schedule: true,
      //   Appointment: true,
      // },
    });
  }
  
  async createTimeSlots(body: CreateTimeSlotDto) {
 
    try {
      var costumerId = "";
      if (!body.customer_id) {
        const customer = await this.prisma.user.create({
          data: {
            name: body.name,
            family: body.family,
            phone: body.phone,
            email: body.email,
            sex: body.sex,
            password: "",
            is_verified: true,
          },
        });
        costumerId = customer.id;
      }
      const slot = await this.prisma.timeSlot.create({
        data: {
          start_time: body.start_time,
          end_time: body.end_time,
          service_id: body.service_id,
          status: TimeSlotEnum.Available,
          customer_id: costumerId != "" ? costumerId : body.customer_id,
          desc: body.desc || "",
        },
      });
     

        //const text = `Hallo ${body.name}, Ihr Termin wurde erstellt: ${starttime}`;
       // await this.smsService.sendTwilioSms(body.phone, text);
      
      return { slot };
    } catch (error) {
      throw error;
    }
  }

  async updateTimeSlotsTimeById(id: string, dataRq: UpdateTimeSlotDto) {
    const starttime=convertToBerlinTime(dataRq.start_time)
    const res= await this.prisma.timeSlot.update({
      where: { id },
      data: {
          start_time:dataRq.start_time,
          end_time:dataRq.end_time,
          service_id:dataRq.service_id,
         
      },

    }
  
  );
  if(res){
    
 // const text = `${dataRq.name &&("Hallo" +" "+ dataRq.name)}, Ihr Termin wurde erstellt: ${starttime}`;
// const smssent= await this.smsService.sendTwilioSms(dataRq.phone, text);
 return true  
}  
return false
}



  async deleteTimeSlotsById(id: string,phone:string) {
   
    try {
      const res= await this.prisma.timeSlot.delete({
        where: { id },
      });
      if(res){
       // const text = `Ihr Termin wurde abgesagt.`;
       // const smssent= await this.smsService.sendTwilioSms(phone, text);
        return true
      }//else return false
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundException(
          "Dienst nicht gefunden oder bereits gelöscht."
        );
      }
      throw error;
    }
  }
  async getUserTimeSlots(query: GetUserTimeSlotsDto) {
    const { 
      user_id, 
      start_time, 
      end_time, 
     
    } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: Prisma.TimeSlotWhereInput = {
      customer_id: user_id,
    };

    // Add time filters if provided
    if (start_time) {
      where.start_time = {
        gte: new Date(start_time),
      };
    }

    if (end_time) {
      where.end_time = {
        lte: new Date(end_time),
      };
    }

    // Get total count for pagination
    const total = await this.prisma.timeSlot.count({
      where,
    });

    // Get paginated results
    const timeSlots = await this.prisma.timeSlot.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        start_time: 'asc',
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            duration: true,
            price: true,
            color: true,
            description: true,
          },
        },
      },
    });

    return {
      data: timeSlots,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

}
