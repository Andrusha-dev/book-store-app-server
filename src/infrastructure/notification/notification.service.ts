import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../core/config/app-config.schema';
import * as nodemailer from 'nodemailer';


@Injectable()
export class NotificationService {
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: configService.get<AppConfig['SMTP_HOST']>('SMTP_HOST'),
      port: configService.get<AppConfig['SMTP_PORT']>('SMTP_PORT'),
      auth: {
        user: configService.get<AppConfig['SMTP_USER']>('SMTP_USER'),
        pass: configService.get<AppConfig['SMTP_PASS']>('SMTP_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<AppConfig["SMTP_FROM"]>("SMTP_FROM"),
      to,
      subject,
      html
    });
    this.logger.log(`Повідомлення успішно надіслано на email ${to}`);
  }
}