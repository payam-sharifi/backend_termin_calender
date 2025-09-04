import { Injectable, NotFoundException } from "@nestjs/common";
import { TimeSlotEnum } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { CreateTimeSlotDto } from "./Dtos/createTimeSlots.dto";
import { GetTimeslotDto } from "./Dtos/getTimeslot.dtos";
import { SmsService } from "../sms/sms.service";
import { UpdateTimeSlotDto } from "./Dtos/updateTimeSlots.dto";
import { convertToBerlinTime } from "utils/time.util";

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
    const starttime=convertToBerlinTime(body.start_time)
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


        
        const text = `Hallo ${body.name}, Ihr Termin wurde erstellt: ${starttime}`;
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
          end_time:dataRq.end_time
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
        const text = `Ihr Termin wurde abgesagt.`;
        const smssent= await this.smsService.sendTwilioSms(phone, text);
        return true
      }else return false
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundException(
          "Dienst nicht gefunden oder bereits gelöscht."
        );
      }
      throw error;
    }
  }


}
