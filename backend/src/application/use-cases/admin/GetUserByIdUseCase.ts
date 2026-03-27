import { injectable, inject } from 'tsyringe';
import { IGetUserByIdUseCase } from '../interfaces/admin/IGetUserByIdUseCase';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { UserResponseDTO } from '../../../application/dtos/admin/UserResponseDTO';

@injectable()
export class GetUserByIdUseCase implements IGetUserByIdUseCase {
  constructor(@inject(TOKENS.IUserRepository) private _userRepo: IUserRepository) {}

  async execute(id: string): Promise<UserResponseDTO> {
    const user = await this._userRepo.findById(id);

    if (!user) throw new NotFoundError('User not found');

    return {
      id: user.id as string,
      userId: user.userId,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      provider: user.provider,
      subscriptionPlan: user.subscriptionPlan,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
