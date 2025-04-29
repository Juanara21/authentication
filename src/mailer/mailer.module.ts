import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Module({
  providers: [MailerService],
  exports: [MailerService], // 👈 exportarlo para que otros módulos lo puedan usar
})
export class MailerModule {}
