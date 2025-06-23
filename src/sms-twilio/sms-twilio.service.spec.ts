import { Test, TestingModule } from '@nestjs/testing';
import { SmsTwilioService } from './sms-twilio.service';

describe('SmsTwilioService', () => {
  let service: SmsTwilioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmsTwilioService],
    }).compile();

    service = module.get<SmsTwilioService>(SmsTwilioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
