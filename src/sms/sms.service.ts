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
  private apiKey = process.env.SEVEN_API_KEY!;
  private sender = process.env.SEVEN_SENDER || 'TerminApp';

  async sendSMS(to: string, text: string): Promise<void> {
    const url = 'https://gateway.seven.io/api/sms';

    const params = new URLSearchParams();
    params.append('to', to);
    params.append('text', text);
    params.append('from', this.sender);
    params.append('p', this.apiKey); 

    try {
      const response = await axios.post(url, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log('SMS sent:', response.data);
    } catch (error) {
      console.error('SMS Error:', error?.response?.data || error.message);
      throw new Error('SMS send failed');
    }
  }

   
  
   
  
    async sendTwilioSms(to: string, message: string): Promise<any> {
      return await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER, // شماره Twilio
        to, // شماره مقصد با کد کشور (مثلاً: +491234567890)
      });
    }
  }

