import { UserResponseDTO } from 'src/application/dtos/admin/UserResponseDTO';

export interface IGetStarUseCase {
  execute(ownerUsername: string, repoName: string): Promise<UserResponseDTO[]>;
}
