import { inject, injectable } from 'tsyringe';
import { ITokenService } from 'src/domain/interfaces/services/ITokenService';
import { IUserRepository } from 'src/domain/interfaces/repositories/IUserRepository';
import { TOKENS } from 'src/shared/constants/tokens';
import { IRefreshTokenUseCase } from '../interfaces/IRefreshTokenUseCase';
import { UnauthorizedError } from 'src/domain/errors/UnauthorizedError';

@injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    @inject(TOKENS.ITokenService) private tokenService: ITokenService,
    @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
  ) {}

  async execute(refreshToken: string): Promise<{ accessToken: string }> {
    if (!refreshToken) throw new UnauthorizedError('No refresh token provided');
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.userRepo.findById(payload.id);

    if (!user) throw new UnauthorizedError('User not found');
    if (user.isBlocked) throw new UnauthorizedError('User is blocked');

    const accessToken = this.tokenService.generateAccessToken({
      id: user.id as string,
      userId: user.userId,
      role: user.role,
    });
    return { accessToken };
  }
}
