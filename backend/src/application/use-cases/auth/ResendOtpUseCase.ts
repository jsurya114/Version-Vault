import { injectable, inject } from 'tsyringe';
import { IResendOtpUseCase } from '../interfaces/IResendOtpUseCase';
import { IUserRepository } from 'src/domain/interfaces/repositories/IUserRepository';
import { IOtpService } from 'src/domain/interfaces/services/IOtpService';
import { IEmailService } from 'src/domain/interfaces/services/IEmailService';
import { TOKENS } from 'src/shared/constants/tokens';
import { NotFoundError } from 'src/domain/errors/NotFoundError';
import { ValidationError } from 'src/domain/errors/ValidationError';
@injectable()
export class ResendOtpUseCase implements IResendOtpUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
    @inject(TOKENS.IOtpService) private otpService: IOtpService,
    @inject(TOKENS.IEmailService) private emailService: IEmailService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundError('No account found with this email');

    if (user.isVerified) throw new ValidationError('Account is already verified');

    const otp = await this.otpService.generateOtp();
    await this.emailService.sendOtpEmail(email, otp);
    return { message: 'OTP resent successfully' };
  }
}
