import { inject, injectable } from 'tsyringe';
import { IAdminRepository } from 'src/domain/interfaces/repositories/IAdminRepository';
import { IGetAllUsersUseCase } from '../interfaces/admin/IGetAllUsersUseCase';
import { TOKENS } from 'src/shared/constants/tokens';
import { UserResponseDTO } from 'src/application/dtos/admin/UserResponseDTO';
import { UserRole } from 'src/domain/enums';

@injectable()
export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(@inject(TOKENS.IAdminRepository) private adminRepo: IAdminRepository) {}

  async execute(): Promise<UserResponseDTO[]> {
    const users = await this.adminRepo.getAllUsers();

    return users.map((user) => ({
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
    }));
  }
}
