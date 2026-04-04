export interface IEmailService {
  sendOtpEmail(to: string, otp: string): Promise<void>;
  sendInvitationEmail(
    to: string,
    ownerUsername: string,
    repositoryName: string,
    role: string,
    inviteLink: string,
  ): Promise<void>;
}
