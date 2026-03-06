import nodemailer from 'nodemailer';
import { injectable } from 'tsyringe';
import type { IEmailService } from 'src/domain/interfaces/services/IEmailService';
import { envConfig } from 'src/shared/config/env.config';
import { logger } from 'src/shared/logger/Logger';
import { resolve4 } from 'node:dns/promises';

@injectable()
export class NodemailerService implements IEmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      let hostParams: any = { host: envConfig.SMTP_HOST };
      try {
        // Force IPv4 lookup to bypass ENETUNREACH failing rapidly on networks lacking IPv6
        const ips = await resolve4(envConfig.SMTP_HOST);
        if (ips && ips.length > 0) {
          hostParams = { host: ips[0], tls: { servername: envConfig.SMTP_HOST } };
        }
      } catch (error) {
        logger.warn(
          `Could not resolve IPv4 for ${envConfig.SMTP_HOST}, falling back to default lookup: ${error}`,
        );
      }

      this.transporter = nodemailer.createTransport({
        ...hostParams,
        port: envConfig.SMTP_PORT,
        secure: envConfig.SMTP_PORT === 465,
        auth: {
          user: envConfig.SMTP_USER,
          pass: envConfig.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const transporter = await this.getTransporter();
    await transporter.sendMail({
      from: envConfig.EMAIL_FROM,
      to,
      subject: 'Version Vault — Email Verification OTP',
      html: this.buildOtpTemplate(otp),
    });

    logger.info(`OTP email sent to ${to}`);
  }

  private buildOtpTemplate(otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a1a1a;">Version Vault</h2>
        <p style="color: #444;">Your email verification OTP is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">This OTP expires in ${envConfig.OTP_EXPIRES_MINUTES} minutes.</p>
        <p style="color: #888; font-size: 13px;">If you did not request this, please ignore this email.</p>
      </div>
    `;
  }
}
