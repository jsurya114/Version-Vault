import { injectable, inject } from 'tsyringe';
import { IResendOtpUseCase } from '../interfaces/IResendOtpUseCase';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IOtpService } from '../../../domain/interfaces/services/IOtpService';
import { IEmailService } from '../../../domain/interfaces/services/IEmailService';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { ILogger } from '../../../domain/interfaces/services/ILogger';

@injectable()
export class ResendOtpUseCase implements IResendOtpUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
    @inject(TOKENS.IOtpService) private otpService: IOtpService,
    @inject(TOKENS.IEmailService) private emailService: IEmailService,
    @inject(TOKENS.ILogger) private _logger: ILogger,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundError('No account found with this email');

    if (user.isVerified) throw new ValidationError('Account is already verified');

    const otp = await this.otpService.generateOtp();
    this._logger.info(`OTP generated for ${email}`);
    await this.otpService.saveOtp(email, otp);
    await this.emailService.sendOtpEmail(email, otp);
    return { message: 'OTP resent successfully' };
  }
}
