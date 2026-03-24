import { UserResponseDTO } from '../../../../application/dtos/admin/UserResponseDTO';

export interface IBlockUserUseCase {
  execute(id: string): Promise<UserResponseDTO>;
}
