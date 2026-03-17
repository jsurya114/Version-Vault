import { UserResponseDTO } from 'src/application/dtos/admin/UserResponseDTO';

export interface IBlockUserUseCase {
  execute(id: string): Promise<UserResponseDTO>;
}
