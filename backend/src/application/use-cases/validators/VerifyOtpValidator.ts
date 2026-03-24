import { injectable, inject } from 'tsyringe';
import type { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import type { IOtpService } from '../../../domain/interfaces/services/IOtpService';
import { TOKENS } from '../../../shared/constants/tokens';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { VerifyOtpDTO } from '../../../application/dtos/auth/VerifyOtpDTO';

@injectable()
export class VerifyOtpValidator {
  constructor(
    @inject(TOKENS.IUserRepository) private readonly userRepo: IUserRepository,
    @inject(TOKENS.IOtpService) private readonly otpService: IOtpService,
  ) {}

  async validate(dto: VerifyOtpDTO): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new NotFoundError('Email not found');

    const isValidOtp = await this.otpService.verifyOtp(dto.email, dto.otp);
    if (!isValidOtp) throw new ValidationError('Not a Valid Otp or Otp expired');
  }
}
