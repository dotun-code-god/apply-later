import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import React from 'react';
import { WelcomeEmail } from './templates/welcome-email.js';
import { VerificationEmail } from './templates/verification-email.js';
import { PasswordResetEmail } from './templates/password-reset-email.js';
import { PasswordChangedEmail } from './templates/password-changed-email.js';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST') ?? 'sandbox.smtp.mailtrap.io',
      port: Number(this.configService.get<string>('EMAIL_PORT') ?? 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER') ?? '',
        pass: this.configService.get<string>('EMAIL_PASS') ?? '',
      },
    });
  }

  private fromAddress(): string {
    return this.configService.get<string>('EMAIL_FROM') ?? 'noreply@applylater.dev';
  }

  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.fromAddress(),
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed sending email to ${to}`, error as Error);
    }
  }

  async sendWelcomeEmail(to: string, name?: string): Promise<void> {
    const html = await render(React.createElement(WelcomeEmail, { name }));
    await this.sendMail(to, 'Welcome to ApplyLater 🎉', html);
  }

  async sendVerificationEmail(to: string, otp: string): Promise<void> {
    const html = await render(React.createElement(VerificationEmail, { otp }));
    await this.sendMail(to, `${otp} is your ApplyLater verification code`, html);
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const html = await render(React.createElement(PasswordResetEmail, { resetUrl }));
    await this.sendMail(to, 'Reset your ApplyLater password', html);
  }

  async sendPasswordChangedEmail(to: string): Promise<void> {
    const html = await render(React.createElement(PasswordChangedEmail, {}));
    await this.sendMail(to, 'Your ApplyLater password was changed', html);
  }
}
