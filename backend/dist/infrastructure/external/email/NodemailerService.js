"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodemailerService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const tsyringe_1 = require("tsyringe");
const env_config_1 = require("../../../shared/config/env.config");
const tokens_1 = require("../../../shared/constants/tokens");
const promises_1 = require("node:dns/promises");
let NodemailerService = class NodemailerService {
    _logger;
    transporter = null;
    constructor(_logger) {
        this._logger = _logger;
    }
    async getTransporter() {
        if (!this.transporter) {
            let hostParams = { host: env_config_1.envConfig.SMTP_HOST };
            try {
                // Force IPv4 lookup to bypass ENETUNREACH failing rapidly on networks lacking IPv6
                const ips = await (0, promises_1.resolve4)(env_config_1.envConfig.SMTP_HOST);
                if (ips && ips.length > 0) {
                    hostParams = { host: ips[0], tls: { servername: env_config_1.envConfig.SMTP_HOST } };
                }
            }
            catch (error) {
                this._logger.warn(`Could not resolve IPv4 for ${env_config_1.envConfig.SMTP_HOST}, falling back to default lookup: ${error}`);
            }
            this.transporter = nodemailer_1.default.createTransport({
                ...hostParams,
                port: env_config_1.envConfig.SMTP_PORT,
                secure: env_config_1.envConfig.SMTP_PORT === 465,
                auth: {
                    user: env_config_1.envConfig.SMTP_USER,
                    pass: env_config_1.envConfig.SMTP_PASS,
                },
            });
        }
        return this.transporter;
    }
    async sendOtpEmail(to, otp) {
        const transporter = await this.getTransporter();
        await transporter.sendMail({
            from: env_config_1.envConfig.EMAIL_FROM,
            to,
            subject: 'Version Vault — Email Verification OTP',
            html: this.buildOtpTemplate(otp),
        });
        this._logger.info(`OTP email sent to ${to}`);
    }
    async sendInvitationEmail(to, ownerUsername, repositoryName, role, inviteLink) {
        const transporter = await this.getTransporter();
        await transporter.sendMail({
            from: env_config_1.envConfig.EMAIL_FROM,
            to,
            subject: `Version Vault — You've been invited to collaborate on ${repositoryName}`,
            html: this.buildInvitationTemplate(ownerUsername, repositoryName, role, inviteLink),
        });
        this._logger.info(`Invitation email sent to ${to}`);
    }
    // ADD this private method inside the class body, after buildOtpTemplate
    buildInvitationTemplate(ownerUsername, repositoryName, role, inviteLink) {
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
    buildOtpTemplate(otp) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a1a1a;">Version Vault</h2>
        <p style="color: #444;">Your email verification OTP is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">This OTP expires in ${env_config_1.envConfig.OTP_EXPIRES_MINUTES} minutes.</p>
        <p style="color: #888; font-size: 13px;">If you did not request this, please ignore this email.</p>
      </div>
    `;
    }
};
exports.NodemailerService = NodemailerService;
exports.NodemailerService = NodemailerService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ILogger)),
    __metadata("design:paramtypes", [Object])
], NodemailerService);
