// src/mailer/mailer.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async sendMail(to: string, subject: string, html: string) {
    return this.transporter.sendMail({
      to,
      subject,
      html,
      from: process.env.MAIL_USER,
    });
  }
}
