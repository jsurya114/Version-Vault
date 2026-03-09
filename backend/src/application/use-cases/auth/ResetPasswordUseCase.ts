import { inject, injectable } from 'tsyringe';
import { IResetPasswordUseCase } from '../interfaces/IResetPasswordUseCase';
import { IUserRepository } from 'src/domain/interfaces/repositories/IUserRepository';
import { IOtpService } from 'src/domain/interfaces/services/IOtpService';
import { IEmailService } from 'src/domain/interfaces/services/IEmailService';
import { IHashService } from 'src/domain/interfaces/services/IHashService';
import { TOKENS } from 'src/shared/constants/tokens';
import { NotFoundError } from 'src/domain/errors/NotFoundError';
import { ValidationError } from 'src/domain/errors/ValidationError';

@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
    @inject(TOKENS.IOtpService) private otpService: IOtpService,
    @inject(TOKENS.IHashService) private passwordService: IHashService,
  ) {}

  async execute(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundError('No account found with this email');
    const isValid = await this.otpService.verifyOtp(email, otp);
    if (!isValid) throw new ValidationError('Invalid or expired OTP');

    const hashedPassword = await this.passwordService.hash(newPassword);
    await this.userRepo.update(user.id as string, { password: hashedPassword });
    return { message: 'Password reset successfully' };
  }
}
