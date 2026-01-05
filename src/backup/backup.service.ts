// src/backup/backup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(private configService: ConfigService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDatabaseBackup() {
    const dbUrl = this.configService.get<string>('DATABASE_URL');
    
    if (!dbUrl) {
      this.logger.error('DATABASE_URL is not defined in configuration');
      return;
    }

    try {
      const parsedUrl = new URL(dbUrl);
      const backupDir = '/var/backups/postgres';
      const date = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `${backupDir}/backup-${date}.sql.gz`;

      await execAsync(`mkdir -p ${backupDir}`);
      
      const command = `PGPASSWORD=${parsedUrl.password} pg_dump \
        -h ${parsedUrl.hostname} \
        -p ${parsedUrl.port} \
        -U ${parsedUrl.username} \
        -d ${parsedUrl.pathname.slice(1)} \
        --clean \
        --if-exists | gzip > ${backupFile}`;
      
      await execAsync(command);
      this.logger.log(`Backup created: ${backupFile}`);

      // Cleanup old backups
      await execAsync(`find ${backupDir} -type f -name "*.sql.gz" -mtime +30 -delete`);
    } catch (error) {
      this.logger.error('Backup failed', error instanceof Error ? error.stack : String(error));
    }
  }
}