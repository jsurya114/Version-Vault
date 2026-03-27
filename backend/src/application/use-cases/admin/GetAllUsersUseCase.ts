import { inject, injectable } from 'tsyringe';
import { IAdminRepository } from '../../../domain/interfaces/repositories/IAdminRepository';
import { IGetAllUsersUseCase } from '../interfaces/admin/IGetAllUsersUseCase';
import { TOKENS } from '../../../shared/constants/tokens';
import { UserResponseDTO } from '../../../application/dtos/admin/UserResponseDTO';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';
import { UserRole } from '../../../domain/enums';

@injectable()
export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(@inject(TOKENS.IAdminRepository) private _adminRepo: IAdminRepository) {}

  async execute(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<UserResponseDTO>> {
    const result = await this._adminRepo.getAllUsers(query);

    return {
      data: result.data
        .filter((p) => p.role !== UserRole.ADMIN)
        .map((user) => ({
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
        })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
