import { injectable, inject } from 'tsyringe';
import { IUnblockUserUseCase } from '../interfaces/admin/IUnblockUserUseCase';
import { IAdminUserRepository } from '../../../domain/interfaces/repositories/IAdminUserRepository';
import { UserResponseDTO } from '../../../application/dtos/admin/UserResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { UserMapper } from '../../../application/mappers/UserMapper';

@injectable()
export class UnblockUserUseCase implements IUnblockUserUseCase {
  constructor(@inject(TOKENS.IAdminRepository) private _adminRepo: IAdminUserRepository) {}

  async execute(id: string): Promise<UserResponseDTO> {
    const user = await this._adminRepo.unblockUser(id);
    if (!user) throw new NotFoundError('User not found');
    return UserMapper.toDTO(user);
  }
}
