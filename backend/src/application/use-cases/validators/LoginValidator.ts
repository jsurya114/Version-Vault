import { injectable, inject } from 'tsyringe';
import type { IUserRepository } from 'src/domain/interfaces/repositories/IUserRepository';
import { LoginDTO } from 'src/application/dtos/auth/LoginDTO';
import { NotFoundError } from 'src/domain/errors/NotFoundError';
import { TOKENS } from 'src/shared/constants/tokens';
import { IHashService } from 'src/domain/interfaces/services/IHashService';
import { UnauthorizedError } from 'src/domain/errors/UnauthorizedError';
import { User } from 'src/domain/entities/User';

@injectable()
export class LoginValidator {
  constructor(
    @inject(TOKENS.IUserRepository) private readonly userRepository: IUserRepository,
    @inject(TOKENS.IHashService) private readonly passwordService: IHashService,
  ) {}

  async validate(validateDto: LoginDTO): Promise<User> {
    const checkUser = await this.userRepository.findByUserId(validateDto.userId);
    if (!checkUser) {
      throw new NotFoundError('UserId not found');
    }
    if (!checkUser.password) throw new NotFoundError('password not found');

    const isPassMatch = await this.passwordService.compare(
      validateDto.password,
      checkUser.password,
    );
    if (!isPassMatch) throw new UnauthorizedError('Invalid credentials');

    return checkUser;
  }
}
