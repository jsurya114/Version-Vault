import { injectable, inject } from 'tsyringe';
import type { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import type { IOtpService } from '../../../domain/interfaces/services/IOtpService';
import { TOKENS } from '../../../shared/constants/tokens';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { IVerifyResetOtpUseCase } from '../interfaces/IVerifyResetOtpUseCase';

@injectable()
export class VerifyResetOtpUseCase implements IVerifyResetOtpUseCase {
  constructor(
    @inject(TOKENS.IOtpService) private readonly otpService: IOtpService,
    @inject(TOKENS.IUserRepository) private readonly userRepo: IUserRepository,
  ) {}

  async execute(email: string, otp: string): Promise<{ message: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundError('Email not found');

    const isValidOtp = await this.otpService.verifyOtp(email, otp);
    if (!isValidOtp) throw new ValidationError('Invalid or expired OTP');

    return { message: 'OTP verified successfully' };
  }
}
