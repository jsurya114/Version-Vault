import { UserResponseDTO } from '../../../../application/dtos/admin/UserResponseDTO';
export interface IUnblockUserUseCase {
  execute(id: string): Promise<UserResponseDTO>;
}
