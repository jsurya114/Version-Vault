import { UserResponseDTO } from 'src/application/dtos/admin/UserResponseDTO';
export interface IUnblockUserUseCase {
  execute(id: string): Promise<UserResponseDTO>;
}
