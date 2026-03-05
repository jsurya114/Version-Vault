 import nodemailer from "nodemailer"
 import { injectable } from "tsyringe"
 import type { IEmailService } from "src/domain/interfaces/services/IEmailService"
 import { envConfig } from "src/shared/config/env.config"
 import { logger } from "src/shared/logger/Logger"

 @injectable()

export class NodemailerService implements IEmailService{
    private readonly transporter = nodemailer.createTransport({
        host:envConfig.SMTP_HOST,
        port:envConfig.SMTP_PORT,
        secure:false,
        auth:{
            user:envConfig.SMTP_USER,
            pass:envConfig.SMTP_PASS
        }
    })


async sendOtpEmail(to: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
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
