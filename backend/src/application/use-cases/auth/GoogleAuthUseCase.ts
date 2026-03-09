import { inject, injectable } from 'tsyringe';
import { IGoogleAuthService } from 'src/domain/interfaces/services/IGoogleAuthService';
import { IGoogleAuthUseCase } from '../interfaces/IGoogleUseCase';
import { IUserRepository } from 'src/domain/interfaces/repositories/IUserRepository';
import { ITokenService } from 'src/domain/interfaces/services/ITokenService';
import { TOKENS } from 'src/shared/constants/tokens';
import { User } from 'src/domain/entities/User';
import { UserMapper } from 'src/application/mappers/UserMapper';
import { AuthProvider, UserRole, SubscriptionPlan } from 'src/domain/enums';

@injectable()
export class GoogleAuthUseCase implements IGoogleAuthUseCase {
  constructor(
    @inject(TOKENS.IGoogleAuthService) private googleAuthService: IGoogleAuthService,
    @inject(TOKENS.IUserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.ITokenService) private tokenService: ITokenService,
  ) {}

  async execute(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; username: string; avatar: string; role: string };
  }> {
    const tokens = await this.googleAuthService.getTokenFromCode(code);
    const googleUser = await this.googleAuthService.getUserInfo(tokens.idToken);
    let user = await this.userRepository.findByEmail(googleUser.email);

    if (!user) {
      const username = googleUser.email.split('@')[0] + '_' + Date.now();
      user = new User({
        userId: username,
        username,
        email: googleUser.email,
        password: '',
        avatar: googleUser.avatar,
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.FREE,
        provider: AuthProvider.GOOGLE,
        isVerified: true,
        isBlocked: false,
        followersCount: 0,
        followingCount: 0,
      });
      user = await this.userRepository.save(user);
    }
    const accessToken = this.tokenService.generateAccessToken({
      id: user.id as string,
      userId: user.userId,
      role: user.role,
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      id: user.id as string,
      userId: user.userId,
      role: user.role,
    });
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id as string,
        email: user.email,
        username: user.username,
        avatar: user.avatar || '',
        role: user.role,
      },
    };
  }
}
