import { injectable, inject } from 'tsyringe';
import type { IUserRepository } from 'src/domain/interfaces/repositories/IUserRepository';
import type { IOtpService } from 'src/domain/interfaces/services/IOtpService';
import type { IVerifyOtpUseCase } from '../interfaces/IVerifyOtpUseCase';
import type { VerifyOtpDTO } from 'src/application/dtos/auth/VerifyOtpDTO';
import { TOKENS } from 'src/shared/constants/tokens';
import { VerifyOtpValidator } from '../validators/VerifyOtpValidator';

@injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    @inject(TOKENS.IOtpService) private readonly otpService: IOtpService,
    @inject(TOKENS.IUserRepository) private readonly userRepo: IUserRepository,
    @inject(VerifyOtpValidator) private readonly validator: VerifyOtpValidator,
  ) {}

  async execute(dto: VerifyOtpDTO): Promise<{ message: string }> {
    await this.validator.validate(dto);
    const user = await this.userRepo.findByEmail(dto.email);
    await this.userRepo.update(user!.id as string, { isVerified: true });

    await this.otpService.deleteOtp(dto.email);

    return { message: 'Email Verified Successfully' };
  }
}
