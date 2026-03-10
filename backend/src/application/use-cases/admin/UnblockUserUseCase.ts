import { injectable, inject } from 'tsyringe';
import { IUnblockUserUseCase } from '../interfaces/admin/IUnblockUserUseCase';
import { IAdminRepository } from 'src/domain/interfaces/repositories/IAdminRepository';
import { UserResponseDTO } from 'src/application/dtos/admin/UserResponseDTO';
import { TOKENS } from 'src/shared/constants/tokens';
import { NotFoundError } from 'src/domain/errors/NotFoundError';

@injectable()
export class UnblockUserUseCase implements IUnblockUserUseCase {
  constructor(@inject(TOKENS.IAdminRepository) private adminRepo: IAdminRepository) {}

  async execute(id: string): Promise<UserResponseDTO> {
    const user = await this.adminRepo.unblockUser(id);
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
