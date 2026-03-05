import { injectable, inject } from 'tsyringe';
import type { IUserRepository } from 'src/domain/interfaces/repositories/IUserRepository';
import { LoginDTO } from 'src/application/dtos/auth/LoginDTO';
import { User } from 'src/domain/entities/User';
import { LoginValidator } from '../validators/LoginValidator';
import { TOKENS } from 'src/shared/constants/tokens';
import { IHashService } from 'src/domain/interfaces/services/IHashService';
import { ITokenService, ITokenPayload } from 'src/domain/interfaces/services/ITokenService';

@injectable()
export class LoginUserCase {
  constructor(
    @inject(TOKENS.IUserRepository) private readonly userRepository: IUserRepository,
    @inject(TOKENS.IHashService) private readonly passwordService: IHashService,
    @inject(TOKENS.ITokenService) private readonly jwtService: ITokenService,
    @inject(LoginValidator) private readonly loginValidator: LoginValidator,
  ) {}

  async execute(userDto: LoginDTO) {
    const user = await this.loginValidator.validate(userDto);
    const accessToken = await this.jwtService.generateAccessToken({
      userId: user.userId,
      role: user.role,
    } as ITokenPayload);
    const refreshToken = await this.jwtService.generateRefreshToken({
      userId: user.userId,
      role: user.role,
    } as ITokenPayload);

    return { accessToken, refreshToken, user };
  }
}
