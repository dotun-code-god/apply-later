import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST') ?? 'smtp.mailtrap.io',
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
    const safeName = name?.trim() || 'there';
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.5;">
        <h2>Welcome to ApplyLater</h2>
        <p>Hi ${safeName}, your account is ready.</p>
        <p>Track deadlines, set reminders, and never miss an opportunity.</p>
      </div>
    `;
    await this.sendMail(to, 'Welcome to ApplyLater', html);
  }

  async sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.5;">
        <h2>Verify your email</h2>
        <p>Please verify your email within 30 minutes by clicking the button below.</p>
        <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">Verify Email</a></p>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `;
    await this.sendMail(to, 'Verify your ApplyLater email', html);
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.5;">
        <h2>Reset your password</h2>
        <p>You requested a password reset. This link expires in 30 minutes.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;">Reset Password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `;
    await this.sendMail(to, 'Reset your ApplyLater password', html);
  }
}
