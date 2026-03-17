import { UserResponseDTO } from 'src/application/dtos/admin/UserResponseDTO';
export interface IGetUserByIdUseCase {
  execute(id: string): Promise<UserResponseDTO>;
}
