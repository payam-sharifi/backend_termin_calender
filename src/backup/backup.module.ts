// src/backup/backup.module.ts
import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({

  providers: [BackupService],
  exports: [BackupService], 
})
export class BackupModule {}