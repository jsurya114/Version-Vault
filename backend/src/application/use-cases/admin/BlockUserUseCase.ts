import { injectable, inject } from 'tsyringe';
import { IBlockUserUseCase } from '../interfaces/admin/IBlockUserUseCase';
import { IAdminUserRepository } from '../../../domain/interfaces/repositories/IAdminUserRepository';
import { UserResponseDTO } from '../../../application/dtos/admin/UserResponseDTO';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { UserMapper } from '../../../application/mappers/UserMapper';

@injectable()
export class BlockUserUseCase implements IBlockUserUseCase {
  constructor(@inject(TOKENS.IAdminRepository) private _adminRepo: IAdminUserRepository) {}

  async execute(id: string): Promise<UserResponseDTO> {
    const user = await this._adminRepo.blockUser(id);
    if (!user) throw new NotFoundError('User not found');

    return UserMapper.toDTO(user);
  }
}
