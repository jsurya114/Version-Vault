import nodemailer from 'nodemailer';
import { injectable, inject } from 'tsyringe';
import type { IEmailService } from '../../../domain/interfaces/services/IEmailService';
import { envConfig } from '../../../shared/config/env.config';
import { ILogger } from '../../../domain/interfaces/services/ILogger';
import { TOKENS } from '../../../shared/constants/tokens';
import { resolve4 } from 'node:dns/promises';

@injectable()
export class NodemailerService implements IEmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(@inject(TOKENS.ILogger) private readonly _logger: ILogger) {}

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      let hostParams: Record<string, unknown> = { host: envConfig.SMTP_HOST };
      try {
        // Force IPv4 lookup to bypass ENETUNREACH failing rapidly on networks lacking IPv6
        const ips = await resolve4(envConfig.SMTP_HOST);
        if (ips && ips.length > 0) {
          hostParams = { host: ips[0], tls: { servername: envConfig.SMTP_HOST } };
        }
      } catch (error) {
        this._logger.warn(
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

    this._logger.info(`OTP email sent to ${to}`);
  }
    async sendInvitationEmail(
    to: string,
    ownerUsername: string,
    repositoryName: string,
    role: string,
    inviteLink: string,
  ): Promise<void> {
    const transporter = await this.getTransporter();
    await transporter.sendMail({
      from: envConfig.EMAIL_FROM,
      to,
      subject: `Version Vault — You've been invited to collaborate on ${repositoryName}`,
      html: this.buildInvitationTemplate(ownerUsername, repositoryName, role, inviteLink),
    });
    this._logger.info(`Invitation email sent to ${to}`);
  }
  // ADD this private method inside the class body, after buildOtpTemplate
  private buildInvitationTemplate(
    ownerUsername: string,
    repositoryName: string,
    role: string,
    inviteLink: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a1a1a;">Version Vault</h2>
        <p style="color: #444;">
          <strong>${ownerUsername}</strong> has invited you to collaborate on the repository
          <strong>${repositoryName}</strong> with <strong>${role}</strong> access.
        </p>
        <div style="margin: 24px 0;">
          <a href="${inviteLink}"
             style="display: inline-block; padding: 12px 24px; background-color: #4f46e5;
                    color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Invitation
          </a>
        </div>
        <p style="color: #888; font-size: 13px;">This invitation expires in 7 days.</p>
        <p style="color: #888; font-size: 13px;">If you did not expect this invitation, you can safely ignore this email.</p>
      </div>
    `;
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
