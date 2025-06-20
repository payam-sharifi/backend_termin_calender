import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
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
}
