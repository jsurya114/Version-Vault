import { injectable, inject } from 'tsyringe';
import { IGetMeUseCase } from '../interfaces/IGetMeUseCase';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { UserResponseDTO } from '../../../application/dtos/admin/UserResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';

@injectable()
export class GetMeUseCase implements IGetMeUseCase {
  constructor(@inject(TOKENS.IUserRepository) private userRepo: IUserRepository) {}

  async execute(userId: string): Promise<UserResponseDTO> {
    const user = await this.userRepo.findByUserId(userId);
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
