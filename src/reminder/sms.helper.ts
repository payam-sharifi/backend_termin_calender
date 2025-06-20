import axios from 'axios';

export async function sendSMS({ to, text }: { to: string; text: string }) {
  return axios.get('https://gateway.seven.io/api/sms', {
    params: {
      to,
      text,
      from: 'TerminApp',
      p: process.env.SEVEN_API_KEY,
    },
  });
}
