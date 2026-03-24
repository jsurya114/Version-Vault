import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IForgotPasswordUseCase } from '../interfaces/IForgotPasswordUseCase';
import { IOtpService } from '../../../domain/interfaces/services/IOtpService';
import { IEmailService } from '../../../domain/interfaces/services/IEmailService';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';

@injectable()
export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    @inject(TOKENS.IEmailService) private emailService: IEmailService,
    @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
    @inject(TOKENS.IOtpService) private otpService: IOtpService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundError('No account found with this email');

    const otp = await this.otpService.generateOtp();

    await this.otpService.saveOtp(email, otp);

    await this.emailService.sendOtpEmail(email, otp);

    return { message: 'Password reset OTP sent to your email' };
  }
}
