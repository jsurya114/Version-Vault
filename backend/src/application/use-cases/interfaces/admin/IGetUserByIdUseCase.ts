import { UserResponseDTO } from '../../../../application/dtos/admin/UserResponseDTO';
export interface IGetUserByIdUseCase {
  execute(id: string): Promise<UserResponseDTO>;
}
