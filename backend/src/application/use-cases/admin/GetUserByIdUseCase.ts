import { injectable, inject } from 'tsyringe';
import { IGetUserByIdUseCase } from '../interfaces/admin/IGetUserByIdUseCase';
import { IUserRepository } from 'src/domain/interfaces/repositories/IUserRepository';
import { TOKENS } from 'src/shared/constants/tokens';
import { NotFoundError } from 'src/domain/errors/NotFoundError';
import { UserResponseDTO } from 'src/application/dtos/admin/UserResponseDTO';

@injectable()
export class GetUserByIdUseCase implements IGetUserByIdUseCase {
  constructor(@inject(TOKENS.IUserRepository) private userRepo: IUserRepository) {}

  async execute(id: string): Promise<UserResponseDTO> {
    let user = await this.userRepo.findById(id);

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
