import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as Twilio from 'twilio';
@Injectable()
export class SmsService {
  private client: Twilio.Twilio;
  constructor() { 
    this.client = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }
  private apiKey = process.env.EASYSENDSMS_API_KEY!;
  private sender = process.env.SMS_SENDER || 'TerminApp';

  async sendTwilioSms(to: string, text: string): Promise<void> {
    const url = process.env.SMS_URL!;

    const body = {
      to,
      text,
      from: this.sender,
      type: '0',
    };

    try {
      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          apikey: this.apiKey,
        },
      });
      console.log('SMS sent:', response.data);
    } catch (error) {
      console.error('SMS Error:', error?.response?.data || error.message);
      throw new Error('SMS send failed');
    }
  }

   
  
   
  //فعال نیست
    async sendTwilioSms1(to: string, message: string): Promise<any> {
      return await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER, // شماره Twilio
        to, // شماره مقصد با کد کشور (مثلاً: +491234567890)
      });
    }
  }

