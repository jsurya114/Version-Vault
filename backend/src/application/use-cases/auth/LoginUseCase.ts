import { injectable, inject } from 'tsyringe';
import type { IUserRepository } from 'src/domain/interfaces/repositories/IUserRepository';
import { LoginDTO } from 'src/application/dtos/auth/LoginDTO';

import { LoginValidator } from '../validators/LoginValidator';
import { TOKENS } from 'src/shared/constants/tokens';
import { IHashService } from 'src/domain/interfaces/services/IHashService';
import { ITokenService, ITokenPayload } from 'src/domain/interfaces/services/ITokenService';

@injectable()
export class LoginUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private readonly userRepository: IUserRepository,
    @inject(TOKENS.IHashService) private readonly passwordService: IHashService,
    @inject(TOKENS.ITokenService) private readonly jwtService: ITokenService,
    @inject(LoginValidator) private readonly loginValidator: LoginValidator,
  ) {}

  async execute(userDto: LoginDTO): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      userId: string;
      username: string;
      email: string;
      role: string;
      avatar?: string;
    };
  }> {
    await this.loginValidator.validate(userDto);

    const user = await this.userRepository.findByUserId(userDto.userId);

    const payload = {
      id: user!.id!,
      userId: user!.userId,
      role: user!.role,
    };

    const accessToken = await this.jwtService.generateAccessToken(payload);
    const refreshToken = await this.jwtService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user!.id!,
        userId: user!.userId,
        username: user!.username,
        email: user!.email,
        role: user!.role,
        avatar: user!.avatar,
      },
    };
  }
}
