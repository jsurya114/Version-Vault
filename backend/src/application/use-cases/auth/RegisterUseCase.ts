import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import type { IHashService } from '../../../domain/interfaces/services/IHashService';
import { IEmailService } from '../../../domain/interfaces/services/IEmailService';
import { IOtpService } from '../../../domain/interfaces/services/IOtpService';
import { RegisterDTO } from '../../dtos/auth/RegisterDTO';
import { User } from '../../../domain/entities/User';
import { RegisterValidator } from '../validators/RegisterValidator';
import { UserRole, SubscriptionPlan, AuthProvider } from '../../../domain/enums';
import { TOKENS } from '../../../shared/constants/tokens';
import { logger } from '../../../shared/logger/Logger';

@injectable()
export class RegisterUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private readonly userRepository: IUserRepository,
    @inject(TOKENS.IEmailService) private readonly emailService: IEmailService,
    @inject(TOKENS.IHashService) private readonly passwordService: IHashService,
    @inject(TOKENS.IOtpService) private readonly otpService: IOtpService,
    @inject(RegisterValidator) private readonly registerValidator: RegisterValidator,
  ) {}

  async execute(userdto: RegisterDTO) {
    await this.registerValidator.validate(userdto);

    const hashedPassword = await this.passwordService.hash(userdto.password);

    const user = new User({
      userId: userdto.userId,
      username: userdto.username,
      email: userdto.email,
      password: hashedPassword,
      role: UserRole.USER,
      isVerified: false,
      isBlocked: false,
      provider: AuthProvider.LOCAL,
      subscriptionPlan: SubscriptionPlan.FREE,
      followersCount: 0,
      followingCount: 0,
    });
    console.log(user);
    //saving the user in db
    await this.userRepository.save(user);

    // generate otp and saving it
    const otp = this.otpService.generateOtp();

    await this.otpService.saveOtp(userdto.email, otp);

    //sending otp to email
    await this.emailService.sendOtpEmail(userdto.email, otp);

    return { message: 'Registration successful. Please verify your email with the OTP sent.' };
  }
}
